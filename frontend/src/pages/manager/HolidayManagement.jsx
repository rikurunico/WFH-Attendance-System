import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { Modal } from '../../components/common/Modal';
import { getHolidays } from '../../api/holiday.api';
import { createHoliday, updateHoliday, deleteHoliday } from '../../api/manager.api';
import { formatDate } from '../../utils/dateHelpers';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const HolidayManagement = () => {
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchHolidays();
  }, [selectedYear]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await getHolidays(selectedYear);
      
      if (response.success) {
        setHolidays(response.data);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error('Gagal mengambil data hari libur');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (holiday = null) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        date: holiday.date,
        name: holiday.name,
        description: holiday.description || '',
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        date: '',
        name: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHoliday(null);
    setFormData({
      date: '',
      name: '',
      description: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      
      let response;
      if (editingHoliday) {
        response = await updateHoliday(editingHoliday.id, formData);
      } else {
        response = await createHoliday(formData);
      }
      
      if (response.success) {
        toast.success(response.message);
        handleCloseModal();
        fetchHolidays();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Operasi gagal';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (holidayId, holidayName) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${holidayName}?`)) {
      return;
    }

    try {
      const response = await deleteHoliday(holidayId);
      
      if (response.success) {
        toast.success(response.message);
        fetchHolidays();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus hari libur';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Hari Libur</h1>
            <p className="text-gray-600 mt-1">Kelola hari libur perusahaan</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input-field"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <Button
              onClick={() => handleOpenModal()}
              className="flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Tambah</span>
            </Button>
          </div>
        </div>

        {/* Holidays List */}
        <Card>
          {holidays.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Tidak ada hari libur ditemukan untuk {selectedYear}</p>
              <Button
                onClick={() => handleOpenModal()}
                variant="outline"
                className="mt-4"
              >
                Tambah Hari Libur Pertama
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-primary-100">
                        <Calendar size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{holiday.name}</p>
                        <p className="text-sm text-gray-600">{formatDate(holiday.date)}</p>
                      </div>
                    </div>
                  </div>

                  {holiday.description && (
                    <p className="text-sm text-gray-600 mb-3">{holiday.description}</p>
                  )}

                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleOpenModal(holiday)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(holiday.id, holiday.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Holiday Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingHoliday ? 'Edit Hari Libur' : 'Tambah Hari Libur Baru'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nama Hari Libur"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="contoh: Hari Raya Idul Fitri"
            required
          />

          <Input
            label="Tanggal"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Deskripsi opsional"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : editingHoliday ? 'Perbarui Hari Libur' : 'Buat Hari Libur'}
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};
