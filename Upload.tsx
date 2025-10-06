import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api-client";
import { UploadCloud, Sparkles, Database, ArrowRight, BarChart3 } from "lucide-react";

export default function Upload() {
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{ candidates_created: number } | null>(null);

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      nav("/login");
    }
  }, [nav]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMsg(null);
      setUploadResult(null); // Resetear resultado anterior
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMsg("Please select a CSV file first");
      return;
    }

    setBusy(true);
    setMsg(null);
    setUploadResult(null);

    try {
      console.log("Starting file upload...");
      const result = await apiClient.uploadCsv(selectedFile);
      setUploadResult(result);
      setMsg(`✅ Successfully uploaded ${result.candidates_created} candidates`);
      
      // Limpiar el archivo seleccionado después de subir
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      setMsg(`❌ Error: ${(error instanceof Error) ? error.message : 'Unknown error'}`);
    } finally {
      setBusy(false);
    }
  };

  const handleViewResults = () => {
    nav("/results");
  };

  const handleDropzoneClick = () => {
    inputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setSelectedFile(file);
        setMsg(null);
        setUploadResult(null);
      } else {
        setMsg("Please select a CSV file");
      }
    }
  };

  // Si no está autenticado, mostrar loading
  if (!apiClient.isAuthenticated()) {
    return (
      <div className="min-h-screen bg-space text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space text-white">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Back to home */}
        <button
          onClick={() => nav("/")}
          className="text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to home
        </button>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
            Data Upload
          </h1>
          <p className="text-slate-300">
            Upload your exoplanet dataset in CSV format
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 items-start">
          {/* Dropzone */}
          <div className="md:col-span-3">
            <div
              className="panel p-10 text-center border-dashed border-2 cursor-pointer hover:border-cyan-400/50 transition-all duration-300"
              onClick={handleDropzoneClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              role="button"
              aria-label="Area for uploading CSV"
              tabIndex={0}
            >
              <div className="flex justify-center mb-4">
                <UploadCloud className="w-16 h-16 text-slate-400" />
              </div>
              <p className="text-xl font-semibold">Drag your CSV file here</p>
              <p className="text-slate-400 mt-1">
                or click to select from your device
              </p>
              
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFile && (
                <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-200 text-sm">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              )}

              <div className="inline-block mt-4 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 text-sm">
                Supported: CSV files with Kepler/TESS data
              </div>
            </div>

            {/* Upload Button */}
            {selectedFile && !uploadResult && (
              <button
                onClick={handleUpload}
                disabled={busy}
                className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Upload CSV File
                  </>
                )}
              </button>
            )}

            {/* Results Button (aparece después de upload exitoso) */}
            {uploadResult && (
              <div className="mt-4 space-y-3">
                <button
                  onClick={handleViewResults}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Analysis Results
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setUploadResult(null);
                    setMsg(null);
                    if (inputRef.current) {
                      inputRef.current.value = '';
                    }
                  }}
                  className="w-full py-2 border border-cyan-400/30 text-cyan-300 rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
                >
                  Upload Another File
                </button>
              </div>
            )}

            {msg && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                msg.includes('✅') 
                  ? 'bg-emerald-500/10 border border-emerald-400/30 text-emerald-200' 
                  : msg.includes('❌')
                  ? 'bg-red-500/10 border border-red-400/30 text-red-200'
                  : 'bg-amber-500/10 border border-amber-400/30 text-amber-200'
              }`}>
                {msg}
              </div>
            )}

            {/* Upload Stats */}
            {uploadResult && (
              <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-cyan-200 mb-2">Upload Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-slate-300">
                    <div className="text-slate-400 text-xs">Candidates Created</div>
                    <div className="text-cyan-400 font-bold text-lg">{uploadResult.candidates_created}</div>
                  </div>
                  <div className="text-slate-300">
                    <div className="text-slate-400 text-xs">Status</div>
                    <div className="text-emerald-400 font-bold text-lg">Success</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-2 space-y-6">
            {/* Info Card */}
            <div className="panel p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-cyan-200">Upload Instructions</h3>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Upload a CSV file containing exoplanet candidate data from Kepler or TESS missions.
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <p>• File must be in CSV format</p>
                <p>• Maximum file size: 10MB</p>
                <p>• Expected columns: kepid, koi_period, koi_prad, etc.</p>
              </div>
            </div>

            {/* Next Steps Card */}
            {uploadResult && (
              <div className="panel p-6 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-emerald-200">Ready to Analyze!</h3>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Your data has been uploaded successfully. Click the button below to view detailed analysis and visualizations.
                </p>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>• View interactive charts and graphs</p>
                  <p>• Analyze candidate classifications</p>
                  <p>• Explore detailed statistics</p>
                </div>
              </div>
            )}

            {/* Help */}
            <div className="panel p-6">
              <h3 className="font-semibold mb-3 text-slate-200">Supported Formats</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Kepler Object of Interest (KOI) data</li>
                <li>• TESS Candidate data</li>
                <li>• Columns: period, radius, koi_score, etc.</li>
                <li>• File encoding: UTF-8</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}