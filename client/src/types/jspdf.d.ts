declare module 'jspdf' {
  class jsPDF {
    constructor(options?: { orientation?: 'portrait' | 'landscape'; unit?: string; format?: string });
    
    // Text methods
    text(text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' | 'justify' }): jsPDF;
    setFontSize(size: number): jsPDF;
    setFont(fontName: string, fontStyle?: string): jsPDF;
    
    // Colors
    setTextColor(r: number, g?: number, b?: number): jsPDF;
    setDrawColor(r: number, g?: number, b?: number): jsPDF;
    setFillColor(r: number, g?: number, b?: number): jsPDF;
    
    // Lines and shapes
    line(x1: number, y1: number, x2: number, y2: number): jsPDF;
    rect(x: number, y: number, w: number, h: number, style?: 'F' | 'S' | 'DF' | 'FD'): jsPDF;
    
    // Pages
    addPage(format?: string, orientation?: 'portrait' | 'landscape'): jsPDF;
    
    // Output
    save(filename: string): jsPDF;
    output(type: string, options?: any): any;
    
    // Document properties
    setProperties(properties: { title?: string; subject?: string; author?: string; keywords?: string; creator?: string }): jsPDF;
    
    // Other methods
    internal: any;
    
    // Added for jspdf-autotable integration
    autoTable: (options: any) => jsPDF;
  }
  
  export { jsPDF };
} 