import fs from 'fs';
import path from 'path';

export interface Project {
  _id: string;
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'cancelled';
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

class JSONStorage {
  private dataDir: string;
  private projects: Project[] = [];
  private sections: Section[] = [];
  private spendings: Spending[] = [];
  private users: User[] = [];

  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.ensureDataDir();
    this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private loadData() {
    try {
      this.projects = this.loadFromFile('projects.json');
      this.sections = this.loadFromFile('sections.json');
      this.spendings = this.loadFromFile('spendings.json');
      this.users = this.loadFromFile('users.json');
    } catch (error) {
      console.log('No existing data found, starting fresh');
      this.initializeDefaultData();
    }
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
    return Math.random().toString(36).substr(2, 9);
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
  }

  // Projects methods
  async getProjects(country?: string): Promise<Project[]> {
    if (country) {
      return this.projects.filter(p => p.country === country);
    }
    return this.projects;
  }

  async createProject(projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const project: Project = {
      ...projectData,
      _id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.projects.push(project);
    this.saveToFile('projects.json', this.projects);
    return project;
  }

  async updateProject(id: string, updateData: Partial<Project>): Promise<Project | null> {
    const index = this.projects.findIndex(p => p._id === id);
    if (index === -1) return null;

    this.projects[index] = {
      ...this.projects[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToFile('projects.json', this.projects);
    return this.projects[index];
  }

  async deleteProject(id: string): Promise<boolean> {
    const index = this.projects.findIndex(p => p._id === id);
    if (index === -1) return false;

    this.projects.splice(index, 1);
    this.saveToFile('projects.json', this.projects);
    return true;
  }

  // Sections methods
  async getSections(country?: string, projectId?: string): Promise<Section[]> {
    let filtered = this.sections;
    
    if (country) {
      filtered = filtered.filter(s => s.country === country);
    }
    
    if (projectId) {
      filtered = filtered.filter(s => s.projectId === projectId);
    }
    
    return filtered;
  }

  async createSection(sectionData: Omit<Section, '_id' | 'createdAt' | 'updatedAt'>): Promise<Section> {
    const section: Section = {
      ...sectionData,
      _id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.sections.push(section);
    this.saveToFile('sections.json', this.sections);
    return section;
  }

  async updateSection(id: string, updateData: Partial<Section>): Promise<Section | null> {
    const index = this.sections.findIndex(s => s._id === id);
    if (index === -1) return null;

    this.sections[index] = {
      ...this.sections[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToFile('sections.json', this.sections);
    return this.sections[index];
  }

  async deleteSection(id: string): Promise<boolean> {
    const index = this.sections.findIndex(s => s._id === id);
    if (index === -1) return false;

    this.sections.splice(index, 1);
    this.saveToFile('sections.json', this.sections);
    return true;
  }

  // Spendings methods
  async getSpendings(country?: string, projectId?: string): Promise<Spending[]> {
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
    const spending: Spending = {
      ...spendingData,
      _id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.spendings.push(spending);
    this.saveToFile('spendings.json', this.spendings);
    return spending;
  }

  async updateSpending(id: string, updateData: Partial<Spending>): Promise<Spending | null> {
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
    const index = this.spendings.findIndex(s => s._id === id);
    if (index === -1) return false;

    this.spendings.splice(index, 1);
    this.saveToFile('spendings.json', this.spendings);
    return true;
  }

  // Users methods
  async getUsers(country?: string): Promise<User[]> {
    if (country) {
      return this.users.filter(u => u.country === country);
    }
    return this.users;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async getUserByUsername(username: string, country?: string): Promise<User | null> {
    if (country) {
      return this.users.find(u => u.username === username && u.country === country) || null;
    }
    return this.users.find(u => u.username === username) || null;
  }

  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      _id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
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
}

const jsonStorageInstance = new JSONStorage();

// Export both named and default exports for compatibility
export { jsonStorageInstance };
export default jsonStorageInstance;