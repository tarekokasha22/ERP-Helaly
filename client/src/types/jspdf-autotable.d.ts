declare module 'jspdf-autotable' {
  import jsPDF from 'jspdf';
  
  interface AutoTableOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    tableLineWidth?: number;
    tableLineColor?: number | string;
    fontSize?: number;
    styles?: {
      font?: string;
      fontStyle?: string;
      overflow?: string;
      fillColor?: number[] | string;
      textColor?: number[] | string;
      halign?: 'left' | 'center' | 'right' | 'justify';
      valign?: 'top' | 'middle' | 'bottom';
      lineColor?: number[] | string;
      lineWidth?: number;
      cellPadding?: number;
      cellWidth?: 'auto' | 'wrap' | number;
    };
    headStyles?: {
      fillColor?: number[] | string;
      textColor?: number[] | string;
      fontStyle?: string;
      lineWidth?: number;
      lineColor?: number[] | string;
      halign?: 'left' | 'center' | 'right' | 'justify';
      valign?: 'top' | 'middle' | 'bottom';
    };
    bodyStyles?: {
      fillColor?: number[] | string;
      textColor?: number[] | string;
      fontStyle?: string;
      lineWidth?: number;
      lineColor?: number[] | string;
      halign?: 'left' | 'center' | 'right' | 'justify';
      valign?: 'top' | 'middle' | 'bottom';
    };
    footStyles?: {
      fillColor?: number[] | string;
      textColor?: number[] | string;
      fontStyle?: string;
      lineWidth?: number;
      lineColor?: number[] | string;
      halign?: 'left' | 'center' | 'right' | 'justify';
      valign?: 'top' | 'middle' | 'bottom';
    };
    alternateRowStyles?: {
      fillColor?: number[] | string;
    };
    columnStyles?: {
      [key: string]: {
        fillColor?: number[] | string;
        textColor?: number[] | string;
        fontStyle?: string;
        halign?: 'left' | 'center' | 'right' | 'justify';
        cellWidth?: 'auto' | 'wrap' | number;
      };
    };
    theme?: 'striped' | 'grid' | 'plain';
    didDrawPage?: (data: any) => void;
    didDrawCell?: (data: any) => void;
    willDrawCell?: (data: any) => void;
    didParseCell?: (data: any) => void;
  }

  function autoTable(doc: jsPDF, options: AutoTableOptions): void;
  
  export default autoTable;
} 