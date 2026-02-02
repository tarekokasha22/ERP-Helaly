import express, { Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import jsonStorage from '../storage/jsonStorage';

const router = express.Router();

/**
 * @route GET /api/inventory
 * @desc Get all inventory items for the user's country
 * @access Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userCountry = (req.user as any)?.country || req.query.country || 'egypt';
        const inventory = await jsonStorage.getInventory(userCountry);

        res.status(200).json({
            success: true,
            data: inventory,
            count: inventory.length
        });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch inventory'
        });
    }
});

/**
 * @route GET /api/inventory/:id
 * @desc Get single inventory item by ID
 * @access Private
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const userCountry = (req.user as any)?.country || 'egypt';
        const inventory = await jsonStorage.getInventory(userCountry);
        const item = inventory.find(i => i.id === req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Inventory item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching inventory item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch inventory item'
        });
    }
});

/**
 * @route POST /api/inventory
 * @desc Create a new inventory item
 * @access Private
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userCountry = (req.user as any)?.country || 'egypt';
        const { name, description, category, quantity, unit, unitPrice, minQuantity, supplier, location, projectId, sectionId } = req.body;

        if (!name || !category || quantity === undefined || !unit || unitPrice === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, category, quantity, unit, unitPrice'
            });
        }

        const totalValue = quantity * unitPrice;
        const status = quantity === 0 ? 'out_of_stock' : quantity <= minQuantity ? 'low_stock' : 'in_stock';

        const newItem = {
            id: `inv-${userCountry.substring(0, 2)}-${Date.now()}`,
            name,
            description: description || '',
            category,
            quantity,
            unit,
            unitPrice,
            totalValue,
            minQuantity: minQuantity || 0,
            supplier: supplier || '',
            location: location || '',
            status,
            projectId: projectId || null,
            sectionId: sectionId || null,
            country: userCountry,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await jsonStorage.addInventoryItem(userCountry, newItem);

        // AUTO-CREATE SPENDING: If item is linked to a project and has value
        if (projectId && totalValue > 0) {
            await jsonStorage.createSpending({
                projectId,
                sectionId: sectionId || undefined,
                amount: totalValue,
                category: 'materials',
                description: `مخزون: ${name} (${quantity} ${unit})`,
                date: new Date().toISOString(),
                country: userCountry
            });
            console.log(`✅ Auto-created spending of ${totalValue} for project ${projectId} from inventory item`);
        }

        res.status(201).json({
            success: true,
            data: newItem,
            message: 'Inventory item created successfully' + (projectId ? ' (spending auto-created)' : '')
        });
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create inventory item'
        });
    }
});

/**
 * @route PUT /api/inventory/:id
 * @desc Update an inventory item
 * @access Private
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const userCountry = (req.user as any)?.country || 'egypt';
        const itemId = req.params.id;
        const updates = req.body;

        const inventory = await jsonStorage.getInventory(userCountry);
        const itemIndex = inventory.findIndex(i => i.id === itemId);

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Inventory item not found'
            });
        }

        // Recalculate totalValue and status if quantity or price changed
        if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
            const qty = updates.quantity ?? inventory[itemIndex].quantity;
            const price = updates.unitPrice ?? inventory[itemIndex].unitPrice;
            const minQty = updates.minQuantity ?? inventory[itemIndex].minQuantity;

            updates.totalValue = qty * price;
            updates.status = qty === 0 ? 'out_of_stock' : qty <= minQty ? 'low_stock' : 'in_stock';
        }

        updates.updatedAt = new Date().toISOString();

        const updatedItem = await jsonStorage.updateInventoryItem(userCountry, itemId, updates);

        res.status(200).json({
            success: true,
            data: updatedItem,
            message: 'Inventory item updated successfully'
        });
    } catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update inventory item'
        });
    }
});

/**
 * @route DELETE /api/inventory/:id
 * @desc Delete an inventory item
 * @access Private
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const userCountry = (req.user as any)?.country || 'egypt';
        const itemId = req.params.id;

        await jsonStorage.deleteInventoryItem(userCountry, itemId);

        res.status(200).json({
            success: true,
            message: 'Inventory item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete inventory item'
        });
    }
});

export default router;
