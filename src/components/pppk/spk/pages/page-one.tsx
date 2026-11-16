import Image from "next/image";
import type { SpkPrintProps } from "../pdf-page-one";
import { formatIndonesianDate, formatSpkOpeningDate } from "@/utils/spk-date-formatter";

export default function SpkPageOne({ data }: { data: SpkPrintProps }) {
  const openingDate = formatSpkOpeningDate(data.tanggalSurat);
  return (
    <div className="spk-a4-page bg-white text-black font-['Arial',sans-serif] text-[12pt] leading-[1.4] p-10 sm:p-14 shadow-md rounded-sm border border-gray-200 max-w-[800px] mx-auto min-h-[1100px] flex flex-col justify-between">
      <div>
        {/* Kop Surat Kiri Atas */}
        <div className="inline-block text-left mb-6">
          <p className="font-bold text-[11pt] tracking-tight">TENTARA NASIONAL INDONESIA</p>
          <p className="font-bold text-[11pt] tracking-tight border-b-2 border-black pb-0.5">
            MARKAS BESAR ANGKATAN LAUT
          </p>
        </div>

        {/* Logo Lambang TNI AL */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/tni-al-logo.png"
            alt="Lambang TNI AL"
            width={85}
            height={95}
            style={{ width: "auto", height: "auto" }}
            className="object-contain"
            priority
          />
        </div>

        {/* Judul & Nomor */}
        <div className="text-center mb-6">
          <h1 className="font-bold text-[13pt] tracking-wide">PERJANJIAN KERJA</h1>
          <p className="text-[12pt]">
            Nomor: {data.nomorSurat || "R/          /XI/2026"}
          </p>
        </div>

        {/* Pembuka */}
        <p className="spk-text-justify mb-3 indent-8">
          Pada hari ini tanggal {openingDate.tanggal} bulan {openingDate.bulan} Tahun {openingDate.tahun} yang bertandatangan di bawah ini:
        </p>

        {/* Pihak Kesatu */}
        <div className="space-y-1 mb-3">
          <div className="grid grid-cols-[30px_160px_15px_1fr]">
            <span>I.</span>
            <span>Nama</span>
            <span>:</span>
            <span className="font-bold">{data.laksma.nama}</span>
          </div>
          <div className="grid grid-cols-[30px_160px_15px_1fr]">
            <span></span>
            <span>Pangkat</span>
            <span>:</span>
            <span>{data.laksma.pangkat}</span>
          </div>
          <div className="grid grid-cols-[30px_160px_15px_1fr]">
            <span></span>
            <span>Jabatan</span>
            <span>:</span>
            <span>{data.laksma.jabatan}</span>
          </div>
          <p className="spk-text-justify indent-8 pt-1">
            dalam hal ini bertindak untuk dan atas nama Kepala Staf Angkatan Laut berdasarkan Kepmenhan Nomor: {data.laksma.kepmenhanNomor} tanggal {formatIndonesianDate(data.laksma.kepmenhanTanggal)}, untuk selanjutnya disebut <strong>Pihak Kesatu</strong>.
          </p>
        </div>

        {/* Pihak Kedua */}
        <div className="space-y-1 mb-4">
          <div className="grid grid-cols-[30px_160px_15px_1fr]">
            <span>II.</span>
            <span>Nama</span>
            <span>:</span>
            <span className="font-bold">{data.pppk.nama}</span>
          </div>
          <div className="grid grid-cols-[30px_160px_15px_1fr]">
            <span></span>
            <span>Nomor Induk PPPK</span>
            <span>:</span>
            <span>{data.pppk.nip}</span>
          </div>
          <div className="grid grid-cols-[30px_160px_15px_1fr]">
            <span></span>
            <span>Tempat/Tanggal Lahir</span>
            <span>:</span>
            <span>{data.pppk.tempatLahir}, {formatIndonesianDate(data.pppk.tanggalLahir)}</span>
          </div>
          <div className="grid grid-cols-[30px_160px_15px_1fr]">
            <span></span>
            <span>Pendidikan</span>
            <span>:</span>
            <span>{data.pppk.pendidikan}</span>
          </div>
          <div className="grid grid-cols-[30px_160px_15px_1fr]">
            <span></span>
            <span>Alamat</span>
            <span>:</span>
            <span>{data.pppk.alamat}</span>
          </div>
          <p className="spk-text-justify indent-8 pt-1">
            dalam hal ini bertindak untuk dan atas nama diri sendiri, untuk selanjutnya disebut <strong>Pihak Kedua</strong>.
          </p>
        </div>

        <p className="spk-text-justify indent-8 mb-5">
          Pihak Kesatu dan Pihak Kedua sepakat untuk mengikatkan diri satu sama lain dalam Perjanjian Kerja dengan ketentuan sebagaimana dituangkan dalam Pasal-Pasal sebagai berikut:
        </p>

        {/* Pasal 1 */}
        <div className="text-center mb-2">
          <p className="font-bold">Pasal 1</p>
          <p className="font-bold">Masa Perjanjian Kerja, Jabatan, dan Unit Kerja</p>
        </div>
        <p className="spk-text-justify mb-2">
          Pihak Kesatu menerima dan mempekerjakan Pihak Kedua sebagai Pegawai Pemerintah dengan Perjanjian Kerja dengan ketentuan sebagai berikut:
        </p>
        <div className="space-y-1 ps-6">
          <div className="grid grid-cols-[25px_180px_15px_1fr]">
            <span>a.</span>
            <span>Masa Perjanjian Kerja</span>
            <span>:</span>
            <span>{formatIndonesianDate(data.masaKerjaMulai)} s.d. {formatIndonesianDate(data.masaKerjaSelesai)}</span>
          </div>
          <div className="grid grid-cols-[25px_180px_15px_1fr]">
            <span>b.</span>
            <span>Jabatan</span>
            <span>:</span>
            <span>{data.pppk.jabatan}</span>
          </div>
          <div className="grid grid-cols-[25px_180px_15px_1fr]">
            <span>c.</span>
            <span>Unit Kerja</span>
            <span>:</span>
            <span>{data.pppk.unitKerja}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

