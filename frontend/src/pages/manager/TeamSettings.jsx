import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ReportSkeleton } from '../../components/common/DashboardSkeleton';
import { getTeamSettings, updateTeamSettings } from '../../api/team.api';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Building2, Clock, Calendar, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const TeamSettings = () => {
  usePageTitle('Pengaturan Tim');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    required_work_hours: '',
    default_leave_quota_days: '',
    max_leave_days_per_month: '',
  });

  useEffect(() => {
    fetchTeamSettings();
  }, []);

  const fetchTeamSettings = async () => {
    try {
      setLoading(true);
      const response = await getTeamSettings();
      
      if (response.success) {
        const { data } = response;
        setFormData({
          name: data.name || '',
          description: data.description || '',
          required_work_hours: data.required_work_hours || '',
          default_leave_quota_days: data.default_leave_quota_days || '',
          max_leave_days_per_month: data.max_leave_days_per_month || '',
        });
      }
    } catch (error) {
      console.error('Error fetching team settings:', error);
      toast.error('Gagal mengambil pengaturan tim');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const response = await updateTeamSettings(formData);
      
      if (response.success) {
        toast.success(response.message || 'Pengaturan tim berhasil diperbarui');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal memperbarui pengaturan tim';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <ReportSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Tim</h1>
          <p className="text-gray-600 mt-1">Kelola pengaturan tim dan kebijakan kerja</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Team Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Building2 size={24} className="mr-2 text-primary-600" />
                  Informasi Tim
                </h2>
                
                <div className="space-y-4">
                  <Input
                    label="Nama Tim"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Nama tim Anda"
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Tim
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field"
                      rows="4"
                      placeholder="Deskripsi singkat tentang tim Anda..."
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Work Hours Settings */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Clock size={24} className="mr-2 text-primary-600" />
                  Pengaturan Jam Kerja
                </h2>
                
                <div className="space-y-4">
                  <Input
                    label="Jam Kerja Wajib per Hari"
                    type="number"
                    step="0.5"
                    min="1"
                    max="24"
                    value={formData.required_work_hours}
                    onChange={(e) => setFormData({ ...formData, required_work_hours: e.target.value })}
                    required
                    helperText="Jumlah jam kerja yang harus dipenuhi karyawan per hari"
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Catatan:</strong> Perubahan pengaturan jam kerja akan berlaku untuk semua karyawan. 
                      Sistem akan menghitung status kehadiran berdasarkan jam kerja yang baru.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Leave Settings */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Calendar size={24} className="mr-2 text-primary-600" />
                  Pengaturan Cuti
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Jatah Cuti Tahunan (hari)"
                      type="number"
                      min="0"
                      max="365"
                      value={formData.default_leave_quota_days}
                      onChange={(e) => setFormData({ ...formData, default_leave_quota_days: e.target.value })}
                      required
                      helperText="Jumlah hari cuti yang dapat diambil karyawan per tahun"
                    />

                    <Input
                      label="Maksimal Cuti per Bulan (hari)"
                      type="number"
                      min="0"
                      max="31"
                      value={formData.max_leave_days_per_month}
                      onChange={(e) => setFormData({ ...formData, max_leave_days_per_month: e.target.value })}
                      required
                      helperText="Batas maksimal cuti yang bisa diambil dalam satu bulan"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Perhatian:</strong> Perubahan jatah cuti tahunan hanya akan berlaku untuk karyawan baru. 
                      Karyawan yang sudah ada akan tetap menggunakan jatah cuti yang sudah ditetapkan sebelumnya.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={fetchTeamSettings}
                disabled={submitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2"
              >
                <Save size={18} />
                <span>{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
