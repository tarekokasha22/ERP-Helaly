import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jsonStorage from '../storage/jsonStorage';
import Employee from '../models/employee.model';
import Payment from '../models/payment.model';

/**
 * Function to seed default users for JSON storage
 */
export const seedUsers = async () => {
  try {
    const users = await jsonStorage.getUsers();
    
    // Only seed if no users exist
    if (users.length === 0) {
      console.log('🌱 Seeding default users...');
      
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      
      // Create admin users for both countries
      const egyptAdmin = await jsonStorage.createUser({
        name: 'مدير مصر',
        username: 'admin',
        email: 'admin.egypt@helaly.com',
        password: adminPassword,
        role: 'admin',
        country: 'egypt'
      });
      
      const libyaAdmin = await jsonStorage.createUser({
        name: 'مدير ليبيا',
        username: 'admin',
        email: 'admin.libya@helaly.com',
        password: adminPassword,
        role: 'admin',
        country: 'libya'
      });
      
      console.log('✅ Default admin users created successfully!');
      console.log('📋 Login credentials:');
      console.log('   Egypt: username="admin", password="admin123"');
      console.log('   Libya: username="admin", password="admin123"');
    } else {
      console.log('👤 Users already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding default users:', error);
    throw error;
  }
}; 

/**
 * Utility function to ensure data files exist
 */
export async function initializeDataFiles() {
  try {
    console.log('📁 Initializing data files...');
    
    // Initialize empty collections if they don't exist
    const projects = await jsonStorage.getProjects();
    const sections = await jsonStorage.getSections();
    const spendings = await jsonStorage.getSpendings();
    
    console.log('✅ Data files initialized successfully!');
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Sections: ${sections.length}`);
    console.log(`   Spendings: ${spendings.length}`);
  } catch (error) {
    console.error('❌ Error initializing data files:', error);
    throw error;
  }
}

/**
 * Verify that admin users exist for both countries
 */
export async function verifyAdminUsers() {
  try {
    console.log('🔍 Verifying admin users...');
    
    const egyptAdmin = await jsonStorage.getUserByUsername('admin', 'egypt');
    const libyaAdmin = await jsonStorage.getUserByUsername('admin', 'libya');
    
    if (!egyptAdmin) {
      console.warn('⚠️  Egypt admin user not found');
    } else {
      console.log('✅ Egypt admin user exists');
    }
    
    if (!libyaAdmin) {
      console.warn('⚠️  Libya admin user not found');
    } else {
      console.log('✅ Libya admin user exists');
    }
    
    return { egyptAdmin: !!egyptAdmin, libyaAdmin: !!libyaAdmin };
  } catch (error) {
    console.error('❌ Error verifying admin users:', error);
    throw error;
  }
}

/**
 * Check if MongoDB is connected
 */
const isMongoDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

/**
 * Seed sample employees into JSON storage (when not using MongoDB)
 */
export const seedEmployeesJSON = async () => {
  try {
    const egyptCount = (await jsonStorage.getEmployees('egypt')).length;
    const libyaCount = (await jsonStorage.getEmployees('libya')).length;
    if (egyptCount > 0 && libyaCount > 0) {
      console.log('👥 Employees already exist in JSON storage, skipping seed');
      return;
    }

    const egyptAdmin = await jsonStorage.getUserByUsername('admin', 'egypt');
    const libyaAdmin = await jsonStorage.getUserByUsername('admin', 'libya');
    const now = new Date().toISOString();

    if (egyptCount === 0 && egyptAdmin) {
      const egyptEmployees = [
        { name: 'أحمد محمد علي', email: 'ahmed.mohamed@helaly.com', phone: '+201234567890', employeeType: 'monthly' as const, position: 'مهندس موقع', monthlySalary: 15000, currency: 'EGP' as const, country: 'egypt' as const, active: true, hireDate: '2023-01-15', notes: 'مهندس مدني', createdBy: egyptAdmin._id },
        { name: 'محمد حسن إبراهيم', email: 'mohamed.hassan@helaly.com', phone: '+201234567891', employeeType: 'monthly' as const, position: 'مدير مشروع', monthlySalary: 25000, currency: 'EGP' as const, country: 'egypt' as const, active: true, hireDate: '2022-06-01', notes: 'مدير مشاريع', createdBy: egyptAdmin._id },
        { name: 'علي محمود أحمد', phone: '+201234567892', employeeType: 'daily' as const, position: 'عامل بناء', dailyRate: 150, currency: 'EGP' as const, country: 'egypt' as const, active: true, hireDate: '2023-03-10', notes: 'عامل بناء', createdBy: egyptAdmin._id },
      ];
      for (const e of egyptEmployees) {
        await jsonStorage.createEmployee(e);
      }
      console.log('✅ Egypt employees seeded in JSON storage');
    }

    if (libyaCount === 0 && libyaAdmin) {
      const libyaEmployees = [
        { name: 'عمر خالد محمد', email: 'omar.khaled@helaly.com', phone: '+218912345678', employeeType: 'monthly' as const, position: 'مهندس موقع', monthlySalary: 800, currency: 'USD' as const, country: 'libya' as const, active: true, hireDate: '2023-02-01', notes: 'مهندس مدني', createdBy: libyaAdmin._id },
        { name: 'خالد أحمد علي', email: 'khaled.ahmed@helaly.com', phone: '+218912345679', employeeType: 'monthly' as const, position: 'مدير مشروع', monthlySalary: 1200, currency: 'USD' as const, country: 'libya' as const, active: true, hireDate: '2022-08-15', notes: 'مدير مشاريع', createdBy: libyaAdmin._id },
      ];
      for (const e of libyaEmployees) {
        await jsonStorage.createEmployee(e);
      }
      console.log('✅ Libya employees seeded in JSON storage');
    }
  } catch (error) {
    console.error('❌ Error seeding employees (JSON):', error);
  }
};

/**
 * Seed sample payments into JSON storage (when not using MongoDB)
 */
export const seedPaymentsJSON = async () => {
  try {
    const egyptPayments = (await jsonStorage.getPayments('egypt')).length;
    const libyaPayments = (await jsonStorage.getPayments('libya')).length;
    if (egyptPayments > 0 && libyaPayments > 0) {
      console.log('💰 Payments already exist in JSON storage, skipping seed');
      return;
    }

    const egyptEmployees = await jsonStorage.getEmployees('egypt');
    const libyaEmployees = await jsonStorage.getEmployees('libya');
    const now = new Date().toISOString();

    for (const emp of [...egyptEmployees, ...libyaEmployees]) {
      if (emp.employeeType === 'monthly' && emp.monthlySalary) {
        await jsonStorage.createPayment({
          employeeId: emp._id,
          paymentType: 'salary',
          amount: emp.monthlySalary,
          currency: emp.currency,
          paymentMethod: 'bank_transfer',
          receiptNumber: `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          description: 'راتب شهري',
          paymentDate: now,
          approvedBy: 'مدير الموارد البشرية',
          country: emp.country,
          createdBy: emp.createdBy,
        });
      }
    }
    if (egyptEmployees.length > 0 || libyaEmployees.length > 0) {
      console.log('✅ Sample payments seeded in JSON storage');
    }
  } catch (error) {
    console.error('❌ Error seeding payments (JSON):', error);
  }
};

/**
 * Function to seed sample employees (MongoDB only)
 */
export const seedEmployees = async () => {
  // Skip if MongoDB is not connected - use JSON seeding instead
  if (!isMongoDBConnected()) {
    await seedEmployeesJSON();
    return;
  }

  try {
    const employees = await Employee.find();
    
    // Only seed if no employees exist
    if (employees.length === 0) {
      console.log('🌱 Seeding sample employees...');
      
      // Get admin users for both countries
      const egyptAdmin = await jsonStorage.getUserByUsername('admin', 'egypt');
      const libyaAdmin = await jsonStorage.getUserByUsername('admin', 'libya');
      
      if (egyptAdmin) {
        // Egypt employees
        const egyptEmployees = [
          {
            name: 'أحمد محمد علي',
            email: 'ahmed.mohamed@helaly.com',
            phone: '+201234567890',
            employeeType: 'monthly',
            position: 'مهندس موقع',
            monthlySalary: 15000,
            currency: 'EGP',
            country: 'egypt',
            hireDate: new Date('2023-01-15'),
            notes: 'مهندس مدني متخصص في الطرق',
            createdBy: egyptAdmin._id,
          },
          {
            name: 'محمد حسن إبراهيم',
            email: 'mohamed.hassan@helaly.com',
            phone: '+201234567891',
            employeeType: 'monthly',
            position: 'مدير مشروع',
            monthlySalary: 25000,
            currency: 'EGP',
            country: 'egypt',
            hireDate: new Date('2022-06-01'),
            notes: 'مدير مشاريع بخبرة 10 سنوات',
            createdBy: egyptAdmin._id,
          },
          {
            name: 'علي محمود أحمد',
            phone: '+201234567892',
            employeeType: 'piecework',
            position: 'عامل بناء',
            pieceworkRate: 150,
            currency: 'EGP',
            country: 'egypt',
            hireDate: new Date('2023-03-10'),
            notes: 'عامل بناء متخصص في الخرسانة',
            createdBy: egyptAdmin._id,
          },
          {
            name: 'سعد عبد الرحمن',
            phone: '+201234567893',
            employeeType: 'piecework',
            position: 'عامل حفر',
            pieceworkRate: 200,
            currency: 'EGP',
            country: 'egypt',
            hireDate: new Date('2023-05-20'),
            notes: 'عامل حفر متخصص في الحفريات',
            createdBy: egyptAdmin._id,
          },
        ];
        
        await Employee.insertMany(egyptEmployees);
        console.log('✅ Egypt employees created successfully!');
      }
      
      if (libyaAdmin) {
        // Libya employees
        const libyaEmployees = [
          {
            name: 'عمر خالد محمد',
            email: 'omar.khaled@helaly.com',
            phone: '+218912345678',
            employeeType: 'monthly',
            position: 'مهندس موقع',
            monthlySalary: 800,
            currency: 'USD',
            country: 'libya',
            hireDate: new Date('2023-02-01'),
            notes: 'مهندس مدني متخصص في الطرق',
            createdBy: libyaAdmin._id,
          },
          {
            name: 'خالد أحمد علي',
            email: 'khaled.ahmed@helaly.com',
            phone: '+218912345679',
            employeeType: 'monthly',
            position: 'مدير مشروع',
            monthlySalary: 1200,
            currency: 'USD',
            country: 'libya',
            hireDate: new Date('2022-08-15'),
            notes: 'مدير مشاريع بخبرة 8 سنوات',
            createdBy: libyaAdmin._id,
          },
          {
            name: 'محمود حسن إبراهيم',
            phone: '+218912345680',
            employeeType: 'piecework',
            position: 'عامل بناء',
            pieceworkRate: 8,
            currency: 'USD',
            country: 'libya',
            hireDate: new Date('2023-04-05'),
            notes: 'عامل بناء متخصص في الخرسانة',
            createdBy: libyaAdmin._id,
          },
        ];
        
        await Employee.insertMany(libyaEmployees);
        console.log('✅ Libya employees created successfully!');
      }
    } else {
      console.log('👥 Employees already exist, skipping seed');
    }
  } catch (error: any) {
    // If MongoDB is not available, just skip seeding (not a critical error)
    const errorMessage = error?.message || '';
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('buffering') || 
        errorMessage.includes('MongooseError') ||
        errorMessage.includes('connection')) {
      console.log('⚠️  MongoDB not available, skipping employee seeding (using JSON storage)');
      return;
    }
    console.error('❌ Error seeding employees:', error);
    // Don't throw - allow server to continue
  }
};

/**
 * Function to seed sample payments (MongoDB or JSON)
 */
export const seedPayments = async () => {
  // When MongoDB is not connected, seed into JSON storage instead
  if (!isMongoDBConnected()) {
    await seedPaymentsJSON();
    return;
  }

  try {
    const payments = await Payment.find();
    
    // Only seed if no payments exist
    if (payments.length === 0) {
      console.log('🌱 Seeding sample payments...');
      
      // Get employees
      const employees = await Employee.find();
      
      if (employees.length > 0) {
        const samplePayments = [];
        
        for (const employee of employees) {
          // Add monthly salary payment
          if (employee.employeeType === 'monthly') {
            samplePayments.push({
              employeeId: employee._id,
              paymentType: 'salary',
              amount: employee.monthlySalary,
              currency: employee.currency,
              paymentMethod: 'bank_transfer',
              receiptNumber: `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              description: `راتب شهر ${new Date().toLocaleDateString('ar-EG', { month: 'long' })}`,
              paymentDate: new Date(),
              approvedBy: 'مدير الموارد البشرية',
              country: employee.country,
              createdBy: employee.createdBy,
            });
          }
          
          // Add advance payment
          const advanceAmount = employee.employeeType === 'monthly' 
            ? (employee.monthlySalary || 0) * 0.3
            : (employee.pieceworkRate || 0) * 10;
          
          samplePayments.push({
            employeeId: employee._id,
            paymentType: 'advance',
            amount: advanceAmount,
            currency: employee.currency,
            paymentMethod: 'cash',
            receiptNumber: `ADV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            description: 'سلفة مالية',
            paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            approvedBy: 'مدير الموارد البشرية',
            country: employee.country,
            createdBy: employee.createdBy,
          });
        }
        
        await Payment.insertMany(samplePayments);
        console.log('✅ Sample payments created successfully!');
      }
    } else {
      console.log('💰 Payments already exist, skipping seed');
    }
  } catch (error: any) {
    // If MongoDB is not available, just skip seeding (not a critical error)
    const errorMessage = error?.message || '';
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('buffering') || 
        errorMessage.includes('MongooseError') ||
        errorMessage.includes('connection')) {
      console.log('⚠️  MongoDB not available, skipping payment seeding (using JSON storage)');
      return;
    }
    console.error('❌ Error seeding payments:', error);
    // Don't throw - allow server to continue
  }
};

/**
 * Main seed function to run on server startup
 */
export async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Initialize data files
    await initializeDataFiles();
    
    // Seed default users
    await seedUsers();
    
    // Verify admin users exist
    await verifyAdminUsers();
    
    // Seed sample employees (only if MongoDB is connected)
    await seedEmployees();
    
    // Seed sample payments (only if MongoDB is connected)
    await seedPayments();
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    // Don't throw error to prevent server from crashing
    console.error('Continuing server startup...');
  }
} 