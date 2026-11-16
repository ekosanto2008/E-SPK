import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer";
import type { SpkPrintProps } from "./pdf-page-one";

const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingLeft: 60,
    paddingRight: 50,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
    color: "#000",
  },
  pageNumber: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 11,
    fontWeight: "bold",
  },
  sectionTitle: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 4,
  },
  articleRow: {
    flexDirection: "row",
    marginBottom: 8,
    textAlign: "justify",
  },
  articleNumber: {
    width: 25,
  },
  articleText: {
    flex: 1,
    textAlign: "justify",
  },
  closingText: {
    marginTop: 10,
    marginBottom: 30,
    textAlign: "justify",
    textIndent: 28,
  },
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  signatureBox: {
    width: "48%",
    alignItems: "center",
    textAlign: "center",
  },
  signTitle: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  signSubtitle: {
    fontSize: 10.5,
  },
  signatureSpace: {
    height: 75,
  },
  laksmaSpace: {
    height: 75,
  },
  signerName: {
    fontWeight: "bold",
    fontSize: 11,
    marginTop: 6,
  },
  signerId: {
    fontSize: 10.5,
  },
});

export function SpkPrintSignatureDoc({ data }: { data: SpkPrintProps }) {
  const pppkNama = data.pppk.nama || "dr. Chendy Fiollitha Sambuari, MBBS.";
  const pppkNip = data.pppk.nip || "199011182023212031";
  const laksmaNama = data.laksma.nama || "Bambang Wasito, S.E., M.Han.";
  const laksmaPangkat = data.laksma.pangkat || "Laksamana Pertama TNI";
  const laksmaJabatan = data.laksma.jabatan || "Kadisminpersal";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Nomor Halaman -10- */}
        <Text style={styles.pageNumber}>-10-</Text>

        {/* Pasal 13 */}
        <Text style={styles.sectionTitle}>Pasal 13</Text>
        <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Lain-lain</Text>

        {/* Ayat 1 */}
        <View style={styles.articleRow}>
          <Text style={styles.articleNumber}>(1)</Text>
          <Text style={styles.articleText}>
            Pihak Kedua bersedia melaksanakan seluruh ketentuan yang telah diatur dalam peraturan kedinasan dan peraturan lainnya yang berlaku di Pihak Kesatu.
          </Text>
        </View>

        {/* Ayat 2 */}
        <View style={styles.articleRow}>
          <Text style={styles.articleNumber}>(2)</Text>
          <Text style={styles.articleText}>
            Pihak Kedua wajib menyimpan dan menjaga kerahasiaan baik dokumen maupun informasi milik Pihak Kesatu sesuai dengan ketentuan peraturan perundang-undangan.
          </Text>
        </View>

        {/* Ayat 3 */}
        <View style={styles.articleRow}>
          <Text style={styles.articleNumber}>(3)</Text>
          <Text style={styles.articleText}>
            Pihak Kesatu dapat memperpanjang masa Perjanjian Kerja yang dilaksanakan sesuai dengan peraturan-perundang-undangan.
          </Text>
        </View>

        {/* Paragraf Penutup */}
        <Text style={styles.closingText}>
          Demikian Perjanjian Kerja ini dibuat dalam rangkap 2 (dua) oleh pihak Kesatu dan Pihak Kedua dalam keadaan sehat dan sadar serta tanpa pengaruh ataupun paksaan dari pihak manapun, masing-masing bermeterai cukup dan mempunyai kekuatan hukum yang sama.
        </Text>

        {/* Tanda Tangan */}
        <View style={styles.signatureContainer}>
          {/* Kolom Kiri: Pihak Kesatu */}
          <View style={styles.signatureBox}>
            <Text style={styles.signTitle}>Pihak Kesatu,</Text>
            <Text style={styles.signSubtitle}>a.n. Kepala Staf Angkatan Laut</Text>
            <Text style={styles.signSubtitle}>{laksmaJabatan},</Text>
            {data.laksma.ttdUrl ? (
              <Image
                src={data.laksma.ttdUrl}
                style={{ width: 130, height: 65, objectFit: "contain", marginVertical: 5 }}
              />
            ) : (
              <View style={styles.laksmaSpace} />
            )}
            <Text style={styles.signerName}>{laksmaNama}</Text>
            <Text style={styles.signerId}>{laksmaPangkat}</Text>
          </View>

          {/* Kolom Kanan: Pihak Kedua */}
          <View style={styles.signatureBox}>
            <Text style={styles.signTitle}>Pihak Kedua,</Text>
            <Text style={[styles.signSubtitle, { color: "transparent" }]}>.</Text>
            <Text style={[styles.signSubtitle, { color: "transparent" }]}>.</Text>
            {/* Spasi kosong bersih untuk meterai fisik & tanda tangan basah (tanpa border & tanpa teks) */}
            <View style={styles.signatureSpace} />
            <Text style={styles.signerName}>{pppkNama}</Text>
            <Text style={styles.signerId}>NI. {pppkNip}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
