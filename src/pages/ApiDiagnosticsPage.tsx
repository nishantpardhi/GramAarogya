import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { integrationService, ApiConfig, AuditLogEntry } from '../services/apiService';
import {
  Server,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Radio,
  FileCode,
  Lock,
} from 'lucide-react';

export const ApiDiagnosticsPage: React.FC = () => {
  const { t, language,  showToast } = useApp();
  const [config, setConfig] = useState<ApiConfig>(() => integrationService.getConfig());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => integrationService.getAuditLogs());
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<
    Record<string, { status: 'idle' | 'testing' | 'success' | 'failed'; message: string; latency?: number }>
  >({});

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    integrationService.saveConfig(config);
    showToast(
      t('auto.text_1229')
    );
  };

  const handleTestAllEndpoints = async () => {
    setIsTesting(true);
    const endpoints = [
      { key: 'hfr', name: 'ABDM Health Facility Registry (HFR)', url: config.hfrEndpoint },
      { key: 'hpr', name: 'ABDM Healthcare Professional Registry (HPR)', url: config.hprEndpoint },
      { key: 'dvdms', name: 'Maharashtra DVDMS e-Aushadhi Portal', url: config.dvdmsEndpoint },
      { key: 'emri108', name: 'Maharashtra 108 EMRI CAD Ambulance Dispatch', url: config.emergency108Endpoint },
      { key: 'eSanjeevani', name: 'e-Sanjeevani Telemedicine National Hub', url: config.eSanjeevaniEndpoint },
    ];

    const newResults: typeof testResults = {};

    for (const ep of endpoints) {
      newResults[ep.key] = {
        status: 'testing',
        message:
          t('auto.text_1230'),
      };
      setTestResults({ ...newResults });

      const res = await integrationService.testConnection(ep.url);
      newResults[ep.key] = {
        status: res.success ? 'success' : 'failed',
        message: res.message,
        latency: res.latencyMs,
      };
      setTestResults({ ...newResults });
    }

    setAuditLogs(integrationService.getAuditLogs());
    setIsTesting(false);
    showToast(
      t('auto.text_1231')
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 text-left">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {t('auto.text_1232')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {t('auto.text_1233')}
              </p>
            </div>
          </div>
        </div>

        {/* Global Mode Switcher Banner */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-2">
            {t('auto.text_1234')}
          </span>
          <button
            onClick={() => {
              
              showToast(
                t('auto.text_1235')
              );
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !false
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
            {t('auto.text_1236')}
          </button>
          <button
            onClick={() => {
              
              showToast(
                t('auto.text_1237')
              );
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              false
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 inline mr-1" />
            {t('auto.text_1238')}
          </button>
        </div>
      </div>

      {/* Mode Explanation Notice */}
      <div
        className={`my-6 p-4 rounded-2xl border text-left ${
          false
            ? 'bg-amber-500/10 border-amber-400/40 text-amber-900 dark:text-amber-200'
            : 'bg-emerald-500/10 border-emerald-400/40 text-emerald-900 dark:text-emerald-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {false ? (
            <Cpu className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs sm:text-sm">
            <strong className="font-bold block mb-0.5">
              {false
                ? t('auto.text_1239')
                : t('auto.text_1240')}
            </strong>
            {false ? (
              <span>
                {t('auto.text_1241')}
              </span>
            ) : (
              <span>
                {t('auto.text_1242')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Left 2 Cols: Gateway Endpoints & Connectivity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('auto.text_1243')}
                </h2>
              </div>

              <button
                onClick={handleTestAllEndpoints}
                disabled={isTesting}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>
                  {isTesting
                    ? t('auto.text_1244')
                    : t('auto.text_1245')}
                </span>
              </button>
            </div>

            {/* Gateway List */}
            <div className="space-y-4 text-xs">
              {/* HFR */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">
                    1. National Health Facility Registry (HFR)
                  </span>
                  <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-bold">
                    ABDM M1 Compliant
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px] break-all mb-2">{config.hfrEndpoint}</div>
                {testResults['hfr'] && (
                  <div
                    className={`p-2 rounded-lg text-[11px] flex items-center gap-2 ${
                      testResults['hfr'].status === 'success'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    {testResults['hfr'].status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>
                      {testResults['hfr'].message}{' '}
                      {testResults['hfr'].latency ? `(${testResults['hfr'].latency}ms)` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* HPR */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">
                    2. Healthcare Professional Registry (HPR)
                  </span>
                  <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-bold">
                    ABDM M2 Verified
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px] break-all mb-2">{config.hprEndpoint}</div>
                {testResults['hpr'] && (
                  <div
                    className={`p-2 rounded-lg text-[11px] flex items-center gap-2 ${
                      testResults['hpr'].status === 'success'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    {testResults['hpr'].status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>
                      {testResults['hpr'].message}{' '}
                      {testResults['hpr'].latency ? `(${testResults['hpr'].latency}ms)` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* DVDMS e-Aushadhi */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">
                    3. Maharashtra DVDMS e-Aushadhi Drug Inventory
                  </span>
                  <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded font-bold">
                    State Drug Logistics
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px] break-all mb-2">{config.dvdmsEndpoint}</div>
                {testResults['dvdms'] && (
                  <div
                    className={`p-2 rounded-lg text-[11px] flex items-center gap-2 ${
                      testResults['dvdms'].status === 'success'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    {testResults['dvdms'].status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>
                      {testResults['dvdms'].message}{' '}
                      {testResults['dvdms'].latency ? `(${testResults['dvdms'].latency}ms)` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* 108 EMRI CAD */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">
                    4. Maharashtra 108 EMRI CAD Emergency Dispatch
                  </span>
                  <span className="text-[10px] font-mono bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded font-bold">
                    Emergency CAD
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px] break-all mb-2">{config.emergency108Endpoint}</div>
                {testResults['emri108'] && (
                  <div
                    className={`p-2 rounded-lg text-[11px] flex items-center gap-2 ${
                      testResults['emri108'].status === 'success'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    {testResults['emri108'].status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>
                      {testResults['emri108'].message}{' '}
                      {testResults['emri108'].latency ? `(${testResults['emri108'].latency}ms)` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('auto.text_1246')}
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {t('auto.text_1247')}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto space-y-2 pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="pt-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{log.action}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    {log.source} • <span className="font-mono text-slate-500">{log.endpoint}</span>
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5">
                    {log.details} — {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Configuration Form */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                {t('auto.text_1248')}
              </h2>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ABDM Client ID (National Health Authority)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SBX_ABDM_MH_09428"
                  value={config.abdmClientId}
                  onChange={(e) => setConfig({ ...config, abdmClientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Government API Secret Token / HMAC Key
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {t('auto.text_1249')}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  HFR Facility Registry URL
                </label>
                <input
                  type="text"
                  value={config.hfrEndpoint}
                  onChange={(e) => setConfig({ ...config, hfrEndpoint: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  DVDMS e-Aushadhi API URL
                </label>
                <input
                  type="text"
                  value={config.dvdmsEndpoint}
                  onChange={(e) => setConfig({ ...config, dvdmsEndpoint: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-sm cursor-pointer"
              >
                {t('auto.text_1250')}
              </button>
            </form>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-400 space-y-2 border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>
                {t('auto.text_1251')}
              </span>
            </div>
            <p>
              {t('auto.text_1252')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
