
import React from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "/public/lovable-uploads/91fd0505-b323-44ce-8632-1456882003e9.png";

type Mission = {
  id: string;
  ref: string;
  client: string;
  chauffeur?: string;
  date: string;
  status: string;
  description?: string;
};

type ExportDropdownProps = {
  missions: Mission[];
};

export default function MissionsExportDropdown({ missions }: ExportDropdownProps) {
  // Colonnes visibles pour l'export
  const columns = [
    { label: "Référence", key: "ref" },
    { label: "Client", key: "client" },
    { label: "Chauffeur", key: "chauffeur" },
    { label: "Date", key: "date" },
    { label: "Statut", key: "status" },
    { label: "Description", key: "description" }
  ];

  // Export PDF
  const handleExportPDF = async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    
    // Dessiner le logo si présent
    const img = new Image();
    img.src = logo;
    img.onload = () => {
      doc.addImage(img, "PNG", 40, 30, 90, 35);
      doc.setFontSize(22);
      doc.setTextColor(20, 45, 117);
      doc.text("Liste des missions", 150, 55);
      doc.setDrawColor(50, 60, 150);
      doc.setLineWidth(1);
      doc.line(40, 75, 555, 75);

      // Format les données
      const data = missions.map(m => [
        m.ref,
        m.client,
        m.chauffeur || "Aucun",
        m.date,
        m.status,
        m.description || "Aucune"
      ]);

      autoTable(doc, {
        head: [columns.map(c => c.label)],
        body: data,
        startY: 90,
        theme: "striped",
        headStyles: { fillColor: [20, 45, 117], textColor: 255, fontSize: 12 },
        bodyStyles: { fontSize: 11 },
        styles: { font: "helvetica", cellPadding: 4 },
        columnStyles: { 5: { cellWidth: 120 } },
      });

      doc.save(`missions_export.pdf`);
    };
  };

  // Export CSV
  const csvHeaders = columns;

  const csvData = missions.map(m => ({
    ref: m.ref,
    client: m.client,
    chauffeur: m.chauffeur || "Aucun",
    date: m.date,
    status: m.status,
    description: m.description || "Aucune",
  }));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="gap-1 font-medium px-3" title="Exporter">
          <Download size={16} />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <CSVLink
            filename="missions_export.csv"
            headers={csvHeaders}
            data={csvData}
            className="w-full text-left"
          >
            Exporter au format CSV
          </CSVLink>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          Exporter au format PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
