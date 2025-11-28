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
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Medical Reports</h3>
                        <button
                            type="button"
                            onClick={() => setShowAddReport(!showAddReport)}
                            className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
                        >
                            {showAddReport ? 'Cancel' : '+ Add Report'}
                        </button>
                    </div>

                    {showAddReport && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">New Report Details</h4>
                            <div className="grid md:grid-cols-2 gap-4 mb-3">
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-500 mb-1">Report Title*</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newReport.title}
                                        onChange={handleReportChange}
                                        className="input-field w-full p-2 border rounded text-sm"
                                        placeholder="e.g. Blood Test, Thalassemia Profile"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="reportDate"
                                        value={newReport.reportDate}
                                        onChange={handleReportChange}
                                        className="input-field w-full p-2 border rounded text-sm"
                                    />
                                </div>

                                {/* Thalassemia Specific Parameters (Patient Only) */}
                                {role === 'patient' && (
                                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3 bg-blue-50 p-3 rounded-lg">
                                        <div className="md:col-span-3">
                                            <p className="text-xs font-semibold text-blue-800 mb-2">Thalassemia Parameters</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Hemoglobin (g/dL)</label>
                                            <input
                                                type="number"
                                                name="hemoglobin"
                                                value={newReport.hemoglobin || ''}
                                                onChange={handleReportChange}
                                                className="input-field w-full p-2 border rounded text-sm"
                                                placeholder="e.g. 9.5"
                                                step="0.1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Ferritin (ng/mL)</label>
                                            <input
                                                type="number"
                                                name="ferritin"
                                                value={newReport.ferritin || ''}
                                                onChange={handleReportChange}
                                                className="input-field w-full p-2 border rounded text-sm"
                                                placeholder="e.g. 1200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Creatinine (mg/dL)</label>
                                            <input
                                                type="number"
                                                name="creatinine"
                                                value={newReport.creatinine || ''}
                                                onChange={handleReportChange}
                                                className="input-field w-full p-2 border rounded text-sm"
                                                placeholder="e.g. 0.8"
                                                step="0.1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">SGPT (ALT)</label>
                                            <input
                                                type="number"
                                                name="sgpt"
                                                value={newReport.sgpt || ''}
                                                onChange={handleReportChange}
                                                className="input-field w-full p-2 border rounded text-sm"
                                                placeholder="e.g. 35"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">SGOT (AST)</label>
                                            <input
                                                type="number"
                                                name="sgot"
                                                value={newReport.sgot || ''}
                                                onChange={handleReportChange}
                                                className="input-field w-full p-2 border rounded text-sm"
                                                placeholder="e.g. 40"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Donor Vitals (Donor Only) */}
                                {role === 'donor' && (
                                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3 bg-green-50 p-3 rounded-lg">
                                        <div className="md:col-span-3">
                                            <p className="text-xs font-semibold text-green-800 mb-2">Donor Vitals</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Hemoglobin (g/dL)</label>
                                            <input
                                                type="number"
                                                name="hemoglobin"
                                                value={newReport.hemoglobin || ''}
                                                onChange={handleReportChange}
                                                className="input-field w-full p-2 border rounded text-sm"
                                                placeholder="e.g. 13.5"
                                                step="0.1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">BP Systolic</label>
                                            <input
                                                type="number"
                                                name="bpSystolic"
                                                value={newReport.bpSystolic || ''}
                                                onChange={handleReportChange}
                                                className="input-field w-full p-2 border rounded text-sm"
                                                placeholder="e.g. 120"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">BP Diastolic</label>
                                            <input
                                                type="number"
                                                name="bpDiastolic"
                                                value={newReport.bpDiastolic || ''}
                                                onChange={handleReportChange}
                                                className="input-field w-full p-2 border rounded text-sm"
                                                placeholder="e.g. 80"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Pulse (bpm)</label>
                                            <input
                                                type="number"
                                                name="pulseRate"
                                                value={newReport.pulseRate || ''}
                                                onChange={handleReportChange}
                                                className="input-field w-full p-2 border rounded text-sm"
                                                placeholder="e.g. 72"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Temp (°C)</label>
                                            <input
                                                type="number"
                                                name="temperature"
                                                value={newReport.temperature || ''}
                                                onChange={handleReportChange}
                                                className="input-field w-full p-2 border rounded text-sm"
                                                placeholder="e.g. 37.0"
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
                                    <input
                                        type="number"
                                        name="heightCm"
                                        value={newReport.heightCm || ''}
                                        onChange={handleReportChange}
                                        className="input-field w-full p-2 border rounded text-sm"
                                        placeholder="e.g. 175"
                                        min="0"
                                        max="300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weightKg"
                                        value={newReport.weightKg || ''}
                                        onChange={handleReportChange}
                                        className="input-field w-full p-2 border rounded text-sm"
                                        placeholder="e.g. 70"
                                        min="0"
                                        max="500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-500 mb-1">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={newReport.notes}
                                        onChange={handleReportChange}
                                        className="input-field w-full p-2 border rounded text-sm"
                                        rows="2"
                                        placeholder="Additional details..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={addReport}
                                    disabled={!newReport.title}
                                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Add to List
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
