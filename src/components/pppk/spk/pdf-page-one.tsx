import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { formatIndonesianDate, formatSpkOpeningDate } from "@/utils/spk-date-formatter";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  headerTni: {
    textAlign: "left",
    fontWeight: "bold",
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 4,
    marginBottom: 20,
    width: "45%",
  },
  titleContainer: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  colLabel: {
    width: "30%",
  },
  colValue: {
    width: "70%",
  },
  pasalHeader: {
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  pasalTitle: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
});

export interface SpkPrintProps {
  nomorSurat: string;
  tanggalSurat: string;
  laksma: {
    nama: string;
    pangkat: string;
    jabatan: string;
    kepmenhanNomor: string;
    kepmenhanTanggal: string;
    ttdUrl?: string;
  };
  pppk: {
    nama: string;
    nip: string;
    tempatLahir: string;
    tanggalLahir: string;
    pendidikan: string;
    alamat: string;
    jabatan: string;
    unitKerja: string;
  };
  masaKerjaMulai: string;
  masaKerjaSelesai: string;
}

export function SpkPageOneDoc({ data }: { data: SpkPrintProps }) {
  const openingDate = formatSpkOpeningDate(data.tanggalSurat);

  return (
    <View>
      <View style={styles.headerTni}>
        <Text>TENTARA NASIONAL INDONESIA</Text>
        <Text>MARKAS BESAR ANGKATAN LAUT</Text>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>PERJANJIAN KERJA</Text>
        <Text style={styles.subtitle}>Nomor: {data.nomorSurat}</Text>
      </View>

      <Text style={{ marginBottom: 10 }}>
        Pada hari ini tanggal {openingDate.tanggal} bulan {openingDate.bulan} tahun {openingDate.tahun} yang bertandatangan di bawah ini:
      </Text>

      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontWeight: "bold", marginBottom: 3 }}>I. PIHAK KESATU</Text>
        <View style={styles.row}>
          <Text style={styles.colLabel}>Nama</Text>
          <Text style={styles.colValue}>: {data.laksma.nama}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.colLabel}>Pangkat</Text>
          <Text style={styles.colValue}>: {data.laksma.pangkat}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.colLabel}>Jabatan</Text>
          <Text style={styles.colValue}>: {data.laksma.jabatan}</Text>
        </View>
        <Text style={{ marginTop: 4 }}>
          dalam hal ini bertindak untuk dan atas nama Kepala Staf Angkatan Laut berdasarkan Kepmenhan Nomor: {data.laksma.kepmenhanNomor} tanggal {formatIndonesianDate(data.laksma.kepmenhanTanggal)}, untuk selanjutnya disebut Pihak Kesatu.
        </Text>
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontWeight: "bold", marginBottom: 3 }}>II. PIHAK KEDUA</Text>
        <View style={styles.row}>
          <Text style={styles.colLabel}>Nama</Text>
          <Text style={styles.colValue}>: {data.pppk.nama}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.colLabel}>Nomor Induk PPPK</Text>
          <Text style={styles.colValue}>: {data.pppk.nip}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.colLabel}>Tempat / Tgl Lahir</Text>
          <Text style={styles.colValue}>: {data.pppk.tempatLahir}, {formatIndonesianDate(data.pppk.tanggalLahir)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.colLabel}>Pendidikan</Text>
          <Text style={styles.colValue}>: {data.pppk.pendidikan}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.colLabel}>Alamat</Text>
          <Text style={styles.colValue}>: {data.pppk.alamat}</Text>
        </View>
      </View>

      <Text style={styles.pasalHeader}>Pasal 1</Text>
      <Text style={styles.pasalTitle}>Masa Perjanjian Kerja, Jabatan, dan Unit Kerja</Text>
      <View style={styles.row}>
        <Text style={styles.colLabel}>a. Masa Perjanjian Kerja</Text>
        <Text style={styles.colValue}>: {formatIndonesianDate(data.masaKerjaMulai)} s.d. {formatIndonesianDate(data.masaKerjaSelesai)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.colLabel}>b. Jabatan</Text>
        <Text style={styles.colValue}>: {data.pppk.jabatan}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.colLabel}>c. Unit Kerja</Text>
        <Text style={styles.colValue}>: {data.pppk.unitKerja}</Text>
      </View>
    </View>
  );
}

