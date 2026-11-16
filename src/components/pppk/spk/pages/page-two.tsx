export default function SpkPageTwo() {
  return (
    <div className="spk-a4-page bg-white text-black font-['Arial',sans-serif] text-[12pt] leading-[1.4] p-10 sm:p-14 shadow-md rounded-sm border border-gray-200 max-w-[800px] mx-auto min-h-[1100px] flex flex-col justify-between">
      <div>
        {/* Nomor Halaman Atas Tengah */}
        <div className="text-center mb-6 font-bold text-[11pt]">-2-</div>

        {/* Pasal 2 */}
        <div className="text-center mb-2">
          <p className="font-bold">Pasal 2</p>
          <p className="font-bold">Tugas Pekerjaan</p>
        </div>
        <div className="space-y-1 mb-4">
          <div className="flex gap-2 spk-text-justify">
            <span className="w-6 shrink-0">(1)</span>
            <p>Pihak Kesatu membuat dan menetapkan tugas pekerjaan yang harus dilaksanakan oleh Pihak Kedua.</p>
          </div>
          <div className="flex gap-2 spk-text-justify">
            <span className="w-6 shrink-0">(2)</span>
            <p>Pihak Kedua wajib melaksanakan tugas pekerjaan yang diberikan Pihak Kesatu dengan sebaik-baiknya dan rasa tanggung jawab.</p>
          </div>
        </div>

        {/* Pasal 3 */}
        <div className="text-center mb-2">
          <p className="font-bold">Pasal 3</p>
          <p className="font-bold">Tugas Kinerja</p>
        </div>
        <div className="space-y-1 mb-4">
          <div className="flex gap-2 spk-text-justify">
            <span className="w-6 shrink-0">(1)</span>
            <p>Pihak Kesatu membuat dan menetapkan target kinerja bagi Pihak Kedua selama masa Perjanjian Kerja.</p>
          </div>
          <div className="flex gap-2 spk-text-justify">
            <span className="w-6 shrink-0">(2)</span>
            <p>Pihak Kedua wajib memenuhi target kinerja yang telah ditetapkan oleh Pihak Kesatu.</p>
          </div>
          <div className="flex gap-2 spk-text-justify">
            <span className="w-6 shrink-0">(3)</span>
            <p>Pihak Kesatu dan Pihak Kedua menandatangani target perjanjian kinerja sesuai peraturan perundang-undangan.</p>
          </div>
        </div>

        {/* Pasal 4 */}
        <div className="text-center mb-2">
          <p className="font-bold">Pasal 4</p>
          <p className="font-bold">Hari Kerja dan Jam Kerja</p>
        </div>
        <p className="spk-text-justify mb-4">
          Pihak Kedua wajib bekerja sesuai dengan hari kerja dan jam kerja yang berlaku di instansi Pihak Kesatu
        </p>

        {/* Pasal 5 */}
        <div className="text-center mb-2">
          <p className="font-bold">Pasal 5</p>
          <p className="font-bold">Disiplin</p>
        </div>
        <div className="space-y-1">
          <div className="flex gap-2 spk-text-justify">
            <span className="w-6 shrink-0">(1)</span>
            <p>Pihak Kedua wajib mematuhi semua kewajiban dan larangan.</p>
          </div>
          <div className="flex gap-2 spk-text-justify">
            <span className="w-6 shrink-0">(2)</span>
            <p>Kewajiban bagi Pihak Kedua sebagaimana dimaksud pada ayat (1) meliputi:</p>
          </div>
          <div className="ps-6 space-y-1">
            <div className="flex gap-2 spk-text-justify">
              <span className="w-5 shrink-0">a.</span>
              <p>Setia dan taat pada Pancasila, Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, Negara Kesatuan Republik Indonesia, dan Pemerintah yang sah;</p>
            </div>
            <div className="flex gap-2 spk-text-justify">
              <span className="w-5 shrink-0">b.</span>
              <p>Menjaga persatuan dan kesatuan bangsa;</p>
            </div>
            <div className="flex gap-2 spk-text-justify">
              <span className="w-5 shrink-0">c.</span>
              <p>Melaksanakan kebijakan yang dirumuskan pejabat pemerintah yang berwenang;</p>
            </div>
            <div className="flex gap-2 spk-text-justify">
              <span className="w-5 shrink-0">d.</span>
              <p>Mentaati ketentuan peraturan perundang-undangan;</p>
            </div>
            <div className="flex gap-2 spk-text-justify">
              <span className="w-5 shrink-0">e.</span>
              <p>Melaksanakan tugas kedinasan dengan penuh pengabdian, kejujuran, kesadaran, dan tanggung jawab;</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
