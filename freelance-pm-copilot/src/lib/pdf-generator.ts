import jsPDF from 'jspdf';

export interface ChangeOrderData {
  contractTitle: string;
  clientName: string;
  clientEmail: string;
  requestText: string;
  analysis: {
    type: 'bug' | 'in-scope' | 'out-of-scope';
    impact: {
      time: string;
      cost: string;
      scope: string;
    };
    options: Array<{
      title: string;
      description: string;
      timeline: string;
      cost: string;
    }>;
  };
  selectedOption: number;
  freelancerName: string;
  freelancerEmail: string;
  date: string;
}

export function generateChangeOrderPDF(data: ChangeOrderData): jsPDF {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Change Order Proposal', 20, 30);
  
  // Contract info
  doc.setFontSize(12);
  doc.text(`Contract: ${data.contractTitle}`, 20, 50);
  doc.text(`Client: ${data.clientName}`, 20, 60);
  doc.text(`Date: ${data.date}`, 20, 70);
  
  // Request details
  doc.setFontSize(14);
  doc.text('Change Request:', 20, 90);
  doc.setFontSize(10);
  const requestLines = doc.splitTextToSize(data.requestText, 170);
  doc.text(requestLines, 20, 100);
  
  // Analysis
  let yPos = 100 + (requestLines.length * 5) + 20;
  doc.setFontSize(14);
  doc.text('Analysis:', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.text(`Type: ${data.analysis.type}`, 20, yPos);
  yPos += 10;
  doc.text(`Time Impact: ${data.analysis.impact.time}`, 20, yPos);
  yPos += 10;
  doc.text(`Cost Impact: ${data.analysis.impact.cost}`, 20, yPos);
  yPos += 10;
  doc.text(`Scope Impact: ${data.analysis.impact.scope}`, 20, yPos);
  
  // Options
  yPos += 20;
  doc.setFontSize(14);
  doc.text('Proposed Options:', 20, yPos);
  
  data.analysis.options.forEach((option, index) => {
    yPos += 15;
    doc.setFontSize(12);
    doc.text(`Option ${index + 1}: ${option.title}`, 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    const optionLines = doc.splitTextToSize(option.description, 170);
    doc.text(optionLines, 20, yPos);
    yPos += (optionLines.length * 5) + 5;
    doc.text(`Timeline: ${option.timeline}`, 20, yPos);
    yPos += 5;
    doc.text(`Cost: ${option.cost}`, 20, yPos);
  });
  
  // Footer
  yPos += 30;
  doc.setFontSize(10);
  doc.text(`Prepared by: ${data.freelancerName}`, 20, yPos);
  doc.text(`Email: ${data.freelancerEmail}`, 20, yPos + 10);
  
  return doc;
}

export function generateContractSummaryPDF(
  contractTitle: string,
  clientName: string,
  deliverables: Array<{ title: string; description: string; acceptanceCriteria: string }>,
  milestones: Array<{ title: string; dueDate: string }>,
  paymentPlan: Array<{ milestoneId: string; amount: number; currency: string; dueDate: string }>
): jsPDF {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Contract Summary', 20, 30);
  
  // Contract info
  doc.setFontSize(12);
  doc.text(`Contract: ${contractTitle}`, 20, 50);
  doc.text(`Client: ${clientName}`, 20, 60);
  
  // Deliverables
  let yPos = 80;
  doc.setFontSize(14);
  doc.text('Deliverables:', 20, yPos);
  
  deliverables.forEach((deliverable, index) => {
    yPos += 15;
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${deliverable.title}`, 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(deliverable.description, 170);
    doc.text(descLines, 20, yPos);
    yPos += (descLines.length * 5) + 5;
    doc.text(`Acceptance Criteria: ${deliverable.acceptanceCriteria}`, 20, yPos);
    yPos += 10;
  });
  
  // Milestones
  yPos += 20;
  doc.setFontSize(14);
  doc.text('Milestones:', 20, yPos);
  
  milestones.forEach((milestone, index) => {
    yPos += 15;
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${milestone.title}`, 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Due Date: ${milestone.dueDate}`, 20, yPos);
    yPos += 10;
  });
  
  // Payment Plan
  yPos += 20;
  doc.setFontSize(14);
  doc.text('Payment Plan:', 20, yPos);
  
  paymentPlan.forEach((payment, index) => {
    yPos += 15;
    doc.setFontSize(12);
    doc.text(`Payment ${index + 1}: ${payment.amount} ${payment.currency}`, 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Due Date: ${payment.dueDate}`, 20, yPos);
    yPos += 10;
  });
  
  return doc;
}
