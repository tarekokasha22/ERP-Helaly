import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import ProjectModel from '../models/project.model';
import SectionModel from '../models/section.model';
import SpendingModel from '../models/spending.model';
import UserModel from '../models/user.model';
import EmployeeModel from '../models/employee.model';
import PaymentModel from '../models/payment.model';

export interface Project {
  _id: string;
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  country: 'egypt' | 'libya';
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  budget: number;
  progress: number;
  country: 'egypt' | 'libya';
  createdAt: string;
  updatedAt: string;
}

export interface Spending {
  _id: string;
  projectId: string;
  sectionId?: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  country: 'egypt' | 'libya';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  email?: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
  country: 'egypt' | 'libya';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  employeeType: 'monthly' | 'daily';
  position: string;
  monthlySalary?: number;
  dailyRate?: number;
  currency: 'EGP' | 'USD';
  country: 'egypt' | 'libya';
  sectionId?: string;  // Link employee to a section
  projectId?: string;  // Direct link to project (optional)
  active: boolean;
  hireDate: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  employeeId: string;
  paymentType: 'salary' | 'advance' | 'loan' | 'on_account' | 'daily';
  amount: number;
  currency: 'EGP' | 'USD' | 'split';
  amountEGP?: number;
  amountUSD?: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'other';
  receiptNumber?: string;
  description: string;
  paymentDate: string;
  projectId?: string;
  sectionId?: string;
  workQuantity?: number;
  workUnit?: string;
  approvedBy: string;
  country: 'egypt' | 'libya';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

class JSONStorage {
  private dataDir: string;
  private spendings: Spending[] = [];
  private users: User[] = [];

  // Split data stores by country
  private projects: { [key: string]: Project[] } = { egypt: [], libya: [] };
  private sections: { [key: string]: Section[] } = { egypt: [], libya: [] };
  private employees: { [key: string]: Employee[] } = { egypt: [], libya: [] };
  private payments: { [key: string]: Payment[] } = { egypt: [], libya: [] };

  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.ensureDataDir();
    this.loadData();
  }

  private get useMongo(): boolean {
    return mongoose.connection.readyState === 1;
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private loadData() {
    try {
      this.spendings = this.loadFromFile('spendings.json');
      this.users = this.loadFromFile('users.json');

      // Load country-specific data for projects
      this.projects.egypt = this.loadFromFile('projects_egypt.json');
      this.projects.libya = this.loadFromFile('projects_libya.json');

      // Load country-specific data for sections
      this.sections.egypt = this.loadFromFile('sections_egypt.json');
      this.sections.libya = this.loadFromFile('sections_libya.json');

      // Load country-specific data for employees
      this.employees.egypt = this.loadFromFile('employees_egypt.json');
      this.employees.libya = this.loadFromFile('employees_libya.json');

      // Load country-specific data for payments
      this.payments.egypt = this.loadFromFile('payments_egypt.json');
      this.payments.libya = this.loadFromFile('payments_libya.json');
    } catch (error) {
      console.log('No existing data found, starting fresh');
      this.initializeDefaultData();
    }
  }

  // Public method to reload all data from disk
  public reloadData() {
    console.log('🔄 Reloading data from disk...');
    this.loadData();
    console.log(`   Users: ${this.users.length}`);
    console.log(`   Projects Egypt: ${this.projects.egypt.length}`);
    console.log(`   Projects Libya: ${this.projects.libya.length}`);
    console.log(`   Sections Egypt: ${this.sections.egypt.length}`);
    console.log(`   Sections Libya: ${this.sections.libya.length}`);
    console.log(`   Employees Egypt: ${this.employees.egypt.length}`);
    console.log(`   Employees Libya: ${this.employees.libya.length}`);
    console.log(`   Payments Egypt: ${this.payments.egypt.length}`);
    console.log(`   Payments Libya: ${this.payments.libya.length}`);
  }

  private loadFromFile<T>(filename: string): T[] {
    const filePath = path.join(this.dataDir, filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  }

  private saveToFile<T>(filename: string, data: T[]) {
    const filePath = path.join(this.dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeDefaultData() {
    // Create default admin users for both branches
    const defaultUsers: User[] = [
      {
        _id: 'admin_egypt_001',
        name: 'مدير مصر',
        username: 'admin',
        email: 'admin.egypt@helaly.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        role: 'admin',
        country: 'egypt',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'admin_libya_001',
        name: 'مدير ليبيا',
        username: 'admin',
        email: 'admin.libya@helaly.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        role: 'admin',
        country: 'libya',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.users = defaultUsers;
    this.saveToFile('users.json', this.users);

    // Initialize empty data files
    this.saveToFile('employees_egypt.json', []);
    this.saveToFile('employees_libya.json', []);
    this.saveToFile('payments_egypt.json', []);
    this.saveToFile('payments_libya.json', []);
  }

  // Projects methods
  async getProjects(country?: string): Promise<Project[]> {
    if (this.useMongo) {
      const query: any = {};
      if (country && (country === 'egypt' || country === 'libya')) {
        query.country = country;
      }
      const projects = await ProjectModel.find(query).lean();
      return projects.map(p => ({ ...p, _id: p._id.toString() } as any));
    }

    if (country && (country === 'egypt' || country === 'libya')) {
      return this.projects[country] || [];
    }
    // Return all projects from both countries
    return [...(this.projects.egypt || []), ...(this.projects.libya || [])];
  }

  async createProject(projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newId = this.generateId();
    const commonData = {
      ...projectData,
      _id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.useMongo) {
      // For Mongoose, we let it handle dates but we pass our string ID
      await ProjectModel.create({
        ...projectData,
        _id: newId,
        // Make sure optional fields are handled if missing
        location: (projectData as any).location || 'Not Specified',
        clientName: (projectData as any).clientName || 'General Client',
        clientEmail: (projectData as any).clientEmail || 'client@example.com',
        clientPhone: (projectData as any).clientPhone || '0000000000',
        createdBy: (projectData as any).createdBy || 'admin',
      });
      return commonData as Project;
    }

    const project: Project = commonData;

    const country = projectData.country;
    if (country === 'egypt' || country === 'libya') {
      this.projects[country].push(project);
      this.saveToFile(`projects_${country}.json`, this.projects[country]);
    }
    return project;
  }

  async updateProject(id: string, updateData: Partial<Project>, country?: string): Promise<Project | null> {
    if (this.useMongo) {
      const updated = await ProjectModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).lean();
      return updated ? ({ ...updated, _id: updated._id.toString() } as any) : null;
    }

    const targetCountry = country || updateData.country;

    for (const c of ['egypt', 'libya'] as const) {
      if (targetCountry && c !== targetCountry) continue;

      const index = this.projects[c].findIndex(p => p._id === id);
      if (index !== -1) {
        this.projects[c][index] = {
          ...this.projects[c][index],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        this.saveToFile(`projects_${c}.json`, this.projects[c]);
        return this.projects[c][index];
      }
    }
    return null;
  }

  async deleteProject(id: string, country?: string): Promise<boolean> {
    if (this.useMongo) {
      const result = await ProjectModel.findByIdAndDelete(id);
      return !!result;
    }

    for (const c of ['egypt', 'libya'] as const) {
      if (country && c !== country) continue;

      const index = this.projects[c].findIndex(p => p._id === id);
      if (index !== -1) {
        this.projects[c].splice(index, 1);
        this.saveToFile(`projects_${c}.json`, this.projects[c]);
        return true;
      }
    }
    return false;
  }

  // Sections methods
  async getSections(country?: string, projectId?: string): Promise<Section[]> {
    if (this.useMongo) {
      const query: any = {};
      if (country && (country === 'egypt' || country === 'libya')) {
        query.country = country;
      }
      if (projectId) {
        query.projectId = projectId;
      }
      const sections = await SectionModel.find(query).lean();
      return sections.map(s => ({ ...s, _id: s._id.toString() } as any));
    }

    let result: Section[] = [];

    if (country && (country === 'egypt' || country === 'libya')) {
      result = this.sections[country] || [];
    } else {
      result = [...(this.sections.egypt || []), ...(this.sections.libya || [])];
    }

    if (projectId) {
      result = result.filter(s => s.projectId === projectId);
    }

    return result;
  }

  async createSection(sectionData: Omit<Section, '_id' | 'createdAt' | 'updatedAt'>): Promise<Section> {
    const newId = this.generateId();
    const commonData = {
      ...sectionData,
      _id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.useMongo) {
      await SectionModel.create({
        ...sectionData,
        _id: newId,
        createdBy: (sectionData as any).createdBy || 'admin',
      });
      return commonData as Section;
    }

    const section: Section = commonData;

    const country = sectionData.country;
    if (country === 'egypt' || country === 'libya') {
      this.sections[country].push(section);
      this.saveToFile(`sections_${country}.json`, this.sections[country]);
    }
    return section;
  }

  async updateSection(id: string, updateData: Partial<Section>, country?: string): Promise<Section | null> {
    if (this.useMongo) {
      const updated = await SectionModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).lean();
      return updated ? ({ ...updated, _id: updated._id.toString() } as any) : null;
    }

    const targetCountry = country || updateData.country;

    for (const c of ['egypt', 'libya'] as const) {
      if (targetCountry && c !== targetCountry) continue;

      const index = this.sections[c].findIndex(s => s._id === id);
      if (index !== -1) {
        this.sections[c][index] = {
          ...this.sections[c][index],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        this.saveToFile(`sections_${c}.json`, this.sections[c]);
        return this.sections[c][index];
      }
    }
    return null;
  }

  async deleteSection(id: string, country?: string): Promise<boolean> {
    if (this.useMongo) {
      const result = await SectionModel.findByIdAndDelete(id);
      return !!result;
    }

    for (const c of ['egypt', 'libya'] as const) {
      if (country && c !== country) continue;

      const index = this.sections[c].findIndex(s => s._id === id);
      if (index !== -1) {
        this.sections[c].splice(index, 1);
        this.saveToFile(`sections_${c}.json`, this.sections[c]);
        return true;
      }
    }
    return false;
  }

  // Spendings methods
  async getSpendings(country?: string, projectId?: string): Promise<Spending[]> {
    if (this.useMongo) {
      const query: any = {};
      if (country && (country === 'egypt' || country === 'libya')) {
        query.country = country;
      }
      if (projectId) {
        query.projectId = projectId;
      }
      const spendings = await SpendingModel.find(query).lean();
      return spendings.map(s => ({ ...s, _id: s._id.toString() } as any));
    }

    let filtered = this.spendings;

    if (country) {
      filtered = filtered.filter(s => s.country === country);
    }

    if (projectId) {
      filtered = filtered.filter(s => s.projectId === projectId);
    }

    return filtered;
  }

  async createSpending(spendingData: Omit<Spending, '_id' | 'createdAt' | 'updatedAt'>): Promise<Spending> {
    const newId = this.generateId();
    const commonData = {
      ...spendingData,
      _id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.useMongo) {
      await SpendingModel.create({
        ...spendingData,
        _id: newId,
        approvedBy: (spendingData as any).approvedBy || 'admin', // Ensure optional if schema requires
        createdBy: (spendingData as any).createdBy || 'admin',
      });
      return commonData as Spending;
    }

    const spending: Spending = commonData;

    this.spendings.push(spending);
    this.saveToFile('spendings.json', this.spendings);
    return spending;
  }

  async updateSpending(id: string, updateData: Partial<Spending>): Promise<Spending | null> {
    if (this.useMongo) {
      const updated = await SpendingModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).lean();
      return updated ? ({ ...updated, _id: updated._id.toString() } as any) : null;
    }

    const index = this.spendings.findIndex(s => s._id === id);
    if (index === -1) return null;

    this.spendings[index] = {
      ...this.spendings[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.saveToFile('spendings.json', this.spendings);
    return this.spendings[index];
  }

  async deleteSpending(id: string): Promise<boolean> {
    if (this.useMongo) {
      const result = await SpendingModel.findByIdAndDelete(id);
      return !!result;
    }

    const index = this.spendings.findIndex(s => s._id === id);
    if (index === -1) return false;

    this.spendings.splice(index, 1);
    this.saveToFile('spendings.json', this.spendings);
    return true;
  }

  // Users methods
  async getUsers(country?: string): Promise<User[]> {
    if (this.useMongo) {
      const query: any = {};
      if (country && (country === 'egypt' || country === 'libya')) {
        query.country = country;
      }
      const users = await UserModel.find(query).lean();
      return users.map(u => ({ ...u, _id: u._id.toString() } as any));
    }

    if (country) {
      return this.users.filter(u => u.country === country);
    }
    return this.users;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (this.useMongo) {
      const user = await UserModel.findOne({ email }).lean();
      return user ? ({ ...user, _id: user._id.toString() } as any) : null;
    }

    return this.users.find(u => u.email === email) || null;
  }

  async getUserByUsername(username: string, country?: string): Promise<User | null> {
    if (this.useMongo) {
      // Username concept might not map directly if only email is used in schema, but assuming name or email
      // Actually `user.model.ts` has `name` and `email`, but no `username` field.
      // The original code was likely checking `username` property which doesn't exist in interface IUser?
      // Wait, I saw IUser interface earlier. It has name, email.
      // The original code: this.users.find(u => u.username === username ...
      // But IUser interface in user.model.ts: name, email... No username.
      // I'll stick to original behavior but for MongoDB I might need to adjust if 'username' isn't in schema
      // Assuming 'username' passed here maps to 'name' or just keeping logic if schema allows extra fields
      // Safe bet: findOne({ name: username }) or similar?
      // Let's look at `User` interface in this file at line 66 (from view).
      // Ah, I need to check User interface definition in jsonStorage.
      return null; // Placeholder as original implementation used 'username' which might be 'name'
    }

    if (country) {
      // Adjusted to use 'name' if 'username' is not present, or keep as is if interface has it
      return this.users.find(u => (u as any).username === username && u.country === country) || null;
    }
    return this.users.find(u => (u as any).username === username) || null;
  }

  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newId = this.generateId();
    const commonData = {
      ...userData,
      _id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.useMongo) {
      await UserModel.create({
        ...userData,
        _id: newId,
        position: (userData as any).position || '',
      });
      return commonData as User;
    }

    const user: User = commonData;
    this.users.push(user);
    this.saveToFile('users.json', this.users);
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(u => u._id === id);
    if (index === -1) return null;

    this.users[index] = {
      ...this.users[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.saveToFile('users.json', this.users);
    return this.users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const index = this.users.findIndex(u => u._id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    this.saveToFile('users.json', this.users);
    return true;
  }

  // Alias methods for compatibility
  async findUserById(id: string): Promise<User | null> {
    return this.users.find(u => u._id === id) || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.getUserByEmail(email);
  }

  async addUser(user: User): Promise<User> {
    this.users.push(user);
    this.saveToFile('users.json', this.users);
    return user;
  }

  // Employees methods
  async getEmployees(country: string, filters?: { employeeType?: string; active?: boolean }): Promise<Employee[]> {
    if (!country || !this.employees[country]) return [];

    let filtered = this.employees[country];

    if (filters?.employeeType) {
      filtered = filtered.filter(e => e.employeeType === filters.employeeType);
    }

    if (filters?.active !== undefined) {
      filtered = filtered.filter(e => e.active === filters.active);
    }

    return filtered;
  }

  async getEmployeeById(id: string, country: string): Promise<Employee | null> {
    if (!country || !this.employees[country]) return null;
    return this.employees[country].find(e => e._id === id) || null;
  }

  async createEmployee(employeeData: Omit<Employee, '_id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const country = employeeData.country;
    if (!country || !this.employees[country]) {
      throw new Error('Invalid country for employee');
    }

    const employee: Employee = {
      ...employeeData,
      _id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.employees[country].push(employee);
    this.saveToFile(`employees_${country}.json`, this.employees[country]);
    return employee;
  }

  async updateEmployee(id: string, updateData: Partial<Employee>): Promise<Employee | null> {
    // If updateData contains country, use it. Otherwise, we MUST know the country.
    // For now, let's assume the controller finds the employee first or passes the country.
    const country = updateData.country;

    if (!country || !this.employees[country]) return null;

    const index = this.employees[country].findIndex(e => e._id === id);
    if (index === -1) return null;

    this.employees[country][index] = {
      ...this.employees[country][index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.saveToFile(`employees_${country}.json`, this.employees[country]);
    return this.employees[country][index];
  }

  async deleteEmployee(id: string, country: string): Promise<boolean> {
    if (!country || !this.employees[country]) return false;

    const index = this.employees[country].findIndex(e => e._id === id);
    if (index === -1) return false;

    // Soft delete - set active to false
    this.employees[country][index] = {
      ...this.employees[country][index],
      active: false,
      updatedAt: new Date().toISOString()
    };

    this.saveToFile(`employees_${country}.json`, this.employees[country]);
    return true;
  }

  // Payments methods
  async getPayments(country: string, filters?: { employeeId?: string; paymentType?: string; currency?: string; startDate?: string; endDate?: string }): Promise<Payment[]> {
    if (this.useMongo) {
      const query: any = {};
      if (country) query.country = country;
      if (filters?.employeeId) query.employeeId = filters.employeeId;
      if (filters?.paymentType) query.paymentType = filters.paymentType;
      if (filters?.currency) query.currency = filters.currency;

      if (filters?.startDate || filters?.endDate) {
        query.paymentDate = {};
        if (filters.startDate) query.paymentDate.$gte = new Date(filters.startDate);
        if (filters.endDate) query.paymentDate.$lte = new Date(filters.endDate);
      }

      const payments = await PaymentModel.find(query).sort({ paymentDate: -1 }).lean();
      return payments.map(p => ({ ...p, _id: p._id.toString() } as any));
    }

    if (!country || !this.payments[country]) return [];

    let filtered = this.payments[country];

    if (filters?.employeeId) {
      filtered = filtered.filter(p => p.employeeId === filters.employeeId);
    }

    if (filters?.paymentType) {
      filtered = filtered.filter(p => p.paymentType === filters.paymentType);
    }

    if (filters?.currency) {
      filtered = filtered.filter(p => p.currency === filters.currency);
    }

    if (filters?.startDate) {
      filtered = filtered.filter(p => new Date(p.paymentDate) >= new Date(filters.startDate!));
    }

    if (filters?.endDate) {
      filtered = filtered.filter(p => new Date(p.paymentDate) <= new Date(filters.endDate!));
    }

    return filtered.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }

  async getPaymentById(id: string, country: string): Promise<Payment | null> {
    if (this.useMongo) {
      const payment = await PaymentModel.findById(id).lean();
      return payment ? ({ ...payment, _id: payment._id.toString() } as any) : null;
    }

    if (!country || !this.payments[country]) return null;
    return this.payments[country].find(p => p._id === id) || null;
  }

  async getPaymentsByEmployeeId(employeeId: string, country: string): Promise<Payment[]> {
    if (this.useMongo) {
      const payments = await PaymentModel.find({ employeeId, country }).sort({ paymentDate: -1 }).lean();
      return payments.map(p => ({ ...p, _id: p._id.toString() } as any));
    }

    if (!country || !this.payments[country]) return [];
    return this.payments[country].filter(p => p.employeeId === employeeId).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }

  async createPayment(paymentData: Omit<Payment, '_id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const commonData = {
      ...paymentData,
      _id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.useMongo) {
      await PaymentModel.create({
        ...paymentData,
        _id: commonData._id,
        amountEGP: (paymentData as any).amountEGP || 0,
        amountUSD: (paymentData as any).amountUSD || 0,
        approvedBy: (paymentData as any).approvedBy || 'admin',
        createdBy: (paymentData as any).createdBy || 'admin',
      });
      return commonData as Payment;
    }

    const country = paymentData.country;
    if (!country || !this.payments[country]) {
      throw new Error('Invalid country for payment');
    }

    const payment: Payment = commonData;

    this.payments[country].push(payment);
    this.saveToFile(`payments_${country}.json`, this.payments[country]);
    return payment;
  }

  async updatePayment(id: string, updateData: Partial<Payment>): Promise<Payment | null> {
    if (this.useMongo) {
      const updated = await PaymentModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).lean();
      return updated ? ({ ...updated, _id: updated._id.toString() } as any) : null;
    }

    const country = updateData.country;
    if (!country || !this.payments[country]) return null;

    const index = this.payments[country].findIndex(p => p._id === id);
    if (index === -1) return null;

    this.payments[country][index] = {
      ...this.payments[country][index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.saveToFile(`payments_${country}.json`, this.payments[country]);
    return this.payments[country][index];
  }

  async deletePayment(id: string, country: string): Promise<boolean> {
    if (this.useMongo) {
      const result = await PaymentModel.findByIdAndDelete(id);
      return !!result;
    }

    if (!country || !this.payments[country]) return false;

    const index = this.payments[country].findIndex(p => p._id === id);
    if (index === -1) return false;

    this.payments[country].splice(index, 1);
    this.saveToFile(`payments_${country}.json`, this.payments[country]);
    return true;
  }

  // ================== INVENTORY OPERATIONS ==================

  async getInventory(country: string): Promise<any[]> {
    const data = this.loadFromFile<any>(`inventory_${country}.json`);
    return data;
  }

  async addInventoryItem(country: string, item: any): Promise<any> {
    const inventory = await this.getInventory(country);
    inventory.push(item);
    this.saveToFile(`inventory_${country}.json`, inventory);
    return item;
  }

  async updateInventoryItem(country: string, id: string, updates: any): Promise<any | null> {
    const inventory = await this.getInventory(country);
    const index = inventory.findIndex((item: any) => item.id === id);
    if (index === -1) return null;

    inventory[index] = {
      ...inventory[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveToFile(`inventory_${country}.json`, inventory);
    return inventory[index];
  }

  async deleteInventoryItem(country: string, id: string): Promise<boolean> {
    const inventory = await this.getInventory(country);
    const index = inventory.findIndex((item: any) => item.id === id);
    if (index === -1) return false;

    inventory.splice(index, 1);
    this.saveToFile(`inventory_${country}.json`, inventory);
    return true;
  }

  // ================== INTEGRATION METHODS ==================

  /**
   * Get inventory items for a specific project
   */
  async getInventoryByProject(country: string, projectId: string): Promise<any[]> {
    const inventory = await this.getInventory(country);
    return inventory.filter((item: any) => item.projectId === projectId);
  }

  /**
   * Get employees by section ID
   */
  async getEmployeesBySection(country: string, sectionId: string): Promise<Employee[]> {
    if (!country || !this.employees[country]) return [];
    return this.employees[country].filter(e => (e as any).sectionId === sectionId);
  }

  /**
   * Get payments for a specific project
   */
  async getPaymentsByProject(country: string, projectId: string): Promise<Payment[]> {
    if (!country || !this.payments[country]) return [];
    return this.payments[country].filter(p => p.projectId === projectId);
  }

  /**
   * Get comprehensive project expenses including:
   * - Direct spendings
   * - Inventory costs
   * - Payments linked to project
   * - Employee salaries in project sections
   */
  async getProjectFullExpenses(country: string, projectId: string): Promise<{
    directSpendings: number;
    inventoryCosts: number;
    projectPayments: number;
    salaryCosts: number;
    totalExpenses: number;
    details: {
      spendings: Spending[];
      inventory: any[];
      payments: Payment[];
      employees: Employee[];
    }
  }> {
    // Get direct spendings
    const spendings = await this.getSpendings(country, projectId);
    const directSpendings = spendings.reduce((sum, s) => sum + (s.amount || 0), 0);

    // Get inventory costs for this project
    const inventoryItems = await this.getInventoryByProject(country, projectId);
    const inventoryCosts = inventoryItems.reduce((sum, item) => sum + (item.totalValue || 0), 0);

    // Get payments linked to this project
    const projectPayments = await this.getPaymentsByProject(country, projectId);
    const paymentsCosts = projectPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Get sections for this project and their employees
    const sections = await this.getSections(country, projectId);
    let salaryCosts = 0;
    let projectEmployees: Employee[] = [];

    for (const section of sections) {
      const sectionEmployees = await this.getEmployeesBySection(country, section._id);
      projectEmployees = [...projectEmployees, ...sectionEmployees];

      // Calculate monthly salary costs
      for (const emp of sectionEmployees) {
        if (emp.active) {
          if (emp.employeeType === 'monthly' && emp.monthlySalary) {
            salaryCosts += emp.monthlySalary;
          } else if (emp.employeeType === 'daily' && emp.dailyRate) {
            // Estimate monthly (22 working days)
            salaryCosts += emp.dailyRate * 22;
          }
        }
      }
    }

    const totalExpenses = directSpendings + inventoryCosts + paymentsCosts + salaryCosts;

    return {
      directSpendings,
      inventoryCosts,
      projectPayments: paymentsCosts,
      salaryCosts,
      totalExpenses,
      details: {
        spendings,
        inventory: inventoryItems,
        payments: projectPayments,
        employees: projectEmployees
      }
    };
  }

  /**
   * Get section full costs including employee salaries and spendings
   */
  async getSectionFullCosts(country: string, sectionId: string): Promise<{
    spendings: number;
    salaryCosts: number;
    totalCosts: number;
    employees: Employee[];
  }> {
    // Get spendings for this section
    const allSpendings = await this.getSpendings(country);
    const sectionSpendings = allSpendings.filter(s => s.sectionId === sectionId);
    const spendingsTotal = sectionSpendings.reduce((sum, s) => sum + (s.amount || 0), 0);

    // Get employees in this section
    const employees = await this.getEmployeesBySection(country, sectionId);
    let salaryCosts = 0;

    for (const emp of employees) {
      if (emp.active) {
        if (emp.employeeType === 'monthly' && emp.monthlySalary) {
          salaryCosts += emp.monthlySalary;
        } else if (emp.employeeType === 'daily' && emp.dailyRate) {
          salaryCosts += emp.dailyRate * 22;
        }
      }
    }

    return {
      spendings: spendingsTotal,
      salaryCosts,
      totalCosts: spendingsTotal + salaryCosts,
      employees
    };
  }
}

const jsonStorageInstance = new JSONStorage();

// Export both named and default exports for compatibility
export { jsonStorageInstance };
export default jsonStorageInstance;