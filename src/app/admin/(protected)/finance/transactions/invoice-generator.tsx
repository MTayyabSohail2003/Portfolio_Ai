
"use client";

import { Document, Page, Text, View, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Send, Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { sendInvoiceEmail } from "@/app/actions/finance-actions"; // We will create this

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#fff', padding: 30 },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  section: { margin: 10, padding: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 12, color: '#666' },
  value: { fontSize: 12, fontWeight: 'bold' },
  total: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#000', paddingTop: 10 },
  totalText: { fontSize: 18, fontWeight: 'bold', textAlign: 'right' }
});

const InvoicePDF = ({ transaction }: { transaction: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>INVOICE</Text>
        <Text style={styles.label}>Inv #{transaction._id ? transaction._id.slice(-6).toUpperCase() : '0000'}</Text>
        <Text style={styles.label}>Date: {new Date(transaction.date).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Bill To:</Text>
        <Text style={styles.value}>Client / Customer</Text>
        <Text style={styles.label}>{transaction.description}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.label}>Amount</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.value}>{transaction.description}</Text>
            <Text style={styles.value}>${transaction.amount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.total}>
         <Text style={styles.totalText}>Total: ${transaction.amount.toFixed(2)}</Text>
      </View>
    </Page>
  </Document>
);

export function InvoiceGenerator({ transaction }: { transaction: any }) {
    if (transaction.type !== "INCOME") return null;

    const handleSendEmail = async () => {
        const res = await sendInvoiceEmail(transaction._id);
        if (res.success) toast.success("Invoice sent to client");
        else toast.error("Failed to send invoice");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-2" /> Invoice
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh]">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Invoice Preview</h2>
                    <Button onClick={handleSendEmail}>
                        <Send className="mr-2 h-4 w-4" /> Email Invoice
                    </Button>
                 </div>
                 <PDFViewer width="100%" height="100%" className="rounded-md border">
                     <InvoicePDF transaction={transaction} />
                 </PDFViewer>
            </DialogContent>
        </Dialog>
    );
}
