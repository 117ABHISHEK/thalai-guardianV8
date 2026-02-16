import { useState, useEffect } from 'react';

const HealthMetricsForm = ({ initialData, onSave, loading, role = 'patient' }) => {
    const [formData, setFormData] = useState({
        medicalReports: [],
    });

    const [newReport, setNewReport] = useState({
        title: '',
        reportDate: new Date().toISOString().split('T')[0],
        // Patient fields
        hemoglobin: '',
        ferritin: '',
        sgpt: '',
        sgot: '',
        creatinine: '',
        // Donor fields
        bpSystolic: '',
        bpDiastolic: '',
        pulseRate: '',
        temperature: '',
        value: '',
        notes: '',
        heightCm: '',
        weightKg: '',
    });

    const [showAddReport, setShowAddReport] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                medicalReports: initialData.medicalReports || [],
            });
        }
    }, [initialData]);

    const handleReportChange = (e) => {
        const { name, value } = e.target;
        setNewReport((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const addReport = () => {
        if (!newReport.title) return;

        setFormData((prev) => ({
            ...prev,
            medicalReports: [...prev.medicalReports, { ...newReport, reportDate: new Date(newReport.reportDate) }],
        }));

        setNewReport({
            title: '',
            reportDate: new Date().toISOString().split('T')[0],
            hemoglobin: '',
            ferritin: '',
            sgpt: '',
            sgot: '',
            creatinine: '',
            bpSystolic: '',
            bpDiastolic: '',
            pulseRate: '',
            temperature: '',
            value: '',
            notes: '',
            heightCm: '',
            weightKg: '',
        });
        setShowAddReport(false);
    };

    const removeReport = (index) => {
        setFormData((prev) => ({
            ...prev,
            medicalReports: prev.medicalReports.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit}>
                <div className="mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                           <h3 className="text-2xl font-display font-black text-slate-900">Medical Reports</h3>
                           <p className="text-slate-500 text-sm font-medium">Historical clinical parameters tracking</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowAddReport(!showAddReport)}
                            className="btn-secondary px-6"
                        >
                            {showAddReport ? 'Cancel Entry' : '+ Log New Report'}
                        </button>
                    </div>

                    {showAddReport && (
                        <div className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-[32px] mb-10 animate-reveal shadow-sm">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">New Clinical Entry</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="input-label">Report Title*</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newReport.title}
                                        onChange={handleReportChange}
                                        className="input-field"
                                        placeholder="e.g. Blood Test, Thalassemia Profile"
                                    />
                                </div>
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="input-label">Report Date</label>
                                    <input
                                        type="date"
                                        name="reportDate"
                                        value={newReport.reportDate}
                                        onChange={handleReportChange}
                                        className="input-field"
                                    />
                                </div>

                                {/* Thalassemia Specific Parameters (Patient Only) */}
                                {role === 'patient' && (
                                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-sky-50/50 p-6 rounded-[24px] border border-sky-100">
                                        <div className="sm:col-span-2 lg:col-span-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-2">Thalassemia Parameters</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="input-label text-[10px]">Hemoglobin (g/dL)</label>
                                            <input
                                                type="number"
                                                name="hemoglobin"
                                                value={newReport.hemoglobin || ''}
                                                onChange={handleReportChange}
                                                className={`input-field ${newReport.hemoglobin && (newReport.hemoglobin < 5 || newReport.hemoglobin > 18) ? 'border-amber-400 bg-amber-50' : ''}`}
                                                placeholder="2 - 20"
                                                step="0.1"
                                                min="2"
                                                max="20"
                                            />
                                            <p className="text-[9px] text-sky-600 mt-1 font-bold">Recommended: 9-11 g/dL</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="input-label text-[10px]">Ferritin (ng/mL)</label>
                                            <input
                                                type="number"
                                                name="ferritin"
                                                value={newReport.ferritin || ''}
                                                onChange={handleReportChange}
                                                className={`input-field ${newReport.ferritin > 5000 ? 'border-amber-400 bg-amber-50' : ''}`}
                                                placeholder="10 - 15000"
                                                min="10"
                                                max="15000"
                                            />
                                            <p className="text-[9px] text-sky-600 mt-1 font-bold">Alert: &gt;2500 ng/mL</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="input-label text-[10px]">Creatinine (mg/dL)</label>
                                            <input
                                                type="number"
                                                name="creatinine"
                                                value={newReport.creatinine || ''}
                                                onChange={handleReportChange}
                                                className="input-field"
                                                placeholder="0.7-1.3"
                                                step="0.01"
                                                min="0"
                                                max="15"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="input-label text-[10px]">SGPT (ALT) - U/L</label>
                                            <input
                                                type="number"
                                                name="sgpt"
                                                value={newReport.sgpt || ''}
                                                onChange={handleReportChange}
                                                className="input-field"
                                                placeholder="Normal: < 40"
                                                min="0"
                                                max="2000"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="input-label text-[10px]">SGOT (AST) - U/L</label>
                                            <input
                                                type="number"
                                                name="sgot"
                                                value={newReport.sgot || ''}
                                                onChange={handleReportChange}
                                                className="input-field"
                                                placeholder="Normal: < 40"
                                                min="0"
                                                max="2000"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Donor Vitals (Donor Only) */}
                                {role === 'donor' && (
                                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-emerald-50/50 p-6 rounded-[24px] border border-emerald-100">
                                        <div className="sm:col-span-2 lg:col-span-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Donor Vitals</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="input-label text-[10px]">Hemoglobin (g/dL)</label>
                                            <input
                                                type="number"
                                                name="hemoglobin"
                                                value={newReport.hemoglobin || ''}
                                                onChange={handleReportChange}
                                                className={`input-field ${newReport.hemoglobin && (newReport.hemoglobin < 12.5) ? 'border-amber-400 bg-amber-50' : ''}`}
                                                placeholder="Min: 12.5"
                                                step="0.1"
                                            />
                                            <p className="text-[9px] text-emerald-600 mt-1 font-bold">Requirement: &gt;12.5 g/dL</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="input-label text-[10px]">BP Systolic/Diastolic</label>
                                            <div className="flex items-center gap-2">
                                               <input
                                                   type="number"
                                                   name="bpSystolic"
                                                   value={newReport.bpSystolic || ''}
                                                   onChange={handleReportChange}
                                                   className="input-field p-2"
                                                   placeholder="Sys"
                                               />
                                               <span className="text-slate-400">/</span>
                                               <input
                                                   type="number"
                                                   name="bpDiastolic"
                                                   value={newReport.bpDiastolic || ''}
                                                   onChange={handleReportChange}
                                                   className="input-field p-2"
                                                   placeholder="Dia"
                                               />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="input-label text-[10px]">Pulse (bpm)</label>
                                            <input
                                                type="number"
                                                name="pulseRate"
                                                value={newReport.pulseRate || ''}
                                                onChange={handleReportChange}
                                                className="input-field"
                                                placeholder="60-100"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="input-label">Physical Dimensions</label>
                                    <div className="flex items-center gap-4">
                                       <div className="flex-1 space-y-1">
                                          <input name="heightCm" value={newReport.heightCm || ''} onChange={handleReportChange} className="input-field p-2" placeholder="H (cm)" />
                                          <p className="text-[8px] font-bold text-slate-400">Height</p>
                                       </div>
                                       <div className="flex-1 space-y-1">
                                          <input name="weightKg" value={newReport.weightKg || ''} onChange={handleReportChange} className="input-field p-2" placeholder="W (kg)" />
                                          <p className="text-[8px] font-bold text-slate-400">Weight</p>
                                       </div>
                                    </div>
                                </div>
                                
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="input-label">Clinical Synthesis (Notes)</label>
                                    <textarea
                                        name="notes"
                                        value={newReport.notes}
                                        onChange={handleReportChange}
                                        className="input-field min-h-[100px] resize-none"
                                        placeholder="Specific observation notes..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setShowAddReport(false)} className="btn-secondary px-8">Discard</button>
                                <button
                                    type="button"
                                    onClick={addReport}
                                    disabled={!newReport.title}
                                    className="btn-primary px-10 disabled:opacity-50"
                                >
                                    Index Report
                                </button>
                            </div>
                        </div>
                    )}

                    {formData.medicalReports.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No reports added yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {formData.medicalReports.map((report, index) => (
                                <div key={index} className="border rounded-lg p-3 bg-white flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                                        <p className="text-xs text-gray-500">
                                            {new Date(report.reportDate).toLocaleDateString()}
                                            {report.value && ` • ${report.value}`}
                                        </p>

                                        {/* Display Thalassemia Parameters if present */}
                                        {(report.hemoglobin || report.ferritin || report.creatinine || report.bpSystolic || report.pulseRate) && (
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {report.hemoglobin && (
                                                    <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100">
                                                        Hb: {report.hemoglobin} g/dL
                                                    </span>
                                                )}
                                                {/* Patient Specific */}
                                                {report.ferritin && (
                                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                                        Ferritin: {report.ferritin} ng/mL
                                                    </span>
                                                )}
                                                {report.creatinine && (
                                                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">
                                                        Creat: {report.creatinine}
                                                    </span>
                                                )}
                                                {(report.sgpt || report.sgot) && (
                                                    <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-100">
                                                        Liver: {report.sgpt || '-'} / {report.sgot || '-'}
                                                    </span>
                                                )}

                                                {/* Donor Specific */}
                                                {(report.bpSystolic || report.bpDiastolic) && (
                                                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                                                        BP: {report.bpSystolic}/{report.bpDiastolic}
                                                    </span>
                                                )}
                                                {report.pulseRate && (
                                                    <span className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded border border-pink-100">
                                                        Pulse: {report.pulseRate}
                                                    </span>
                                                )}
                                                {report.temperature && (
                                                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">
                                                        Temp: {report.temperature}°C
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Display Height and Weight if present */}
                                        {(report.heightCm || report.weightKg) && (
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {report.heightCm && (
                                                    <span className="text-xs bg-gray-50 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                                                        Height: {report.heightCm} cm
                                                    </span>
                                                )}
                                                {report.weightKg && (
                                                    <span className="text-xs bg-gray-50 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                                                        Weight: {report.weightKg} kg
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {report.notes && <p className="text-sm text-gray-600 mt-1">{report.notes}</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeReport(index)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary bg-health-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Health Metrics'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HealthMetricsForm;
