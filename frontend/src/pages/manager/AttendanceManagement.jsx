import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { getAllAttendances, editAttendance, deleteAttendance } from '../../api/manager.api';
import { formatDate, formatTime, formatHours, getMonthStart, getMonthEnd, formatDateTimeForInput } from '../../utils/dateHelpers';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Clock, Edit, Trash2, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const AttendanceManagement = () => {
  usePageTitle('Absensi');
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState(getMonthStart());
  const [endDate, setEndDate] = useState(getMonthEnd());
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  const [editFormData, setEditFormData] = useState({
    check_in: '',
    check_out: '',
    reason: '',
  });

  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    fetchAttendances(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAttendances = async (page = 1, perPage = 10) => {
    try {
      setLoading(true);
      const response = await getAllAttendances(startDate, endDate, page, perPage);

      if (response.success) {
        setAttendances(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching attendances:', error);
      toast.error('Failed to fetch attendances');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchAttendances(1, pagination.per_page);
  };

  const handlePageChange = (page) => {
    fetchAttendances(page, pagination.per_page);
  };

  const handlePerPageChange = (perPage) => {
    fetchAttendances(1, perPage);
  };

  const handleOpenEditModal = (attendance) => {
    setEditingAttendance(attendance);
    setEditFormData({
      check_in: attendance.check_in ? formatDateTimeForInput(attendance.check_in) : '',
      check_out: attendance.check_out ? formatDateTimeForInput(attendance.check_out) : '',
      reason: '',
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingAttendance(null);
    setEditFormData({
      check_in: '',
      check_out: '',
      reason: '',
    });
  };

  const handleOpenDeleteModal = (attendance) => {
    setEditingAttendance(attendance);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setEditingAttendance(null);
    setDeleteReason('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.reason || editFormData.reason.length < 10) {
      toast.error('Alasan wajib diisi (minimal 10 karakter)');
      return;
    }

    try {
      setSubmitting(true);
      const response = await editAttendance(
        editingAttendance.id,
        editFormData.check_in,
        editFormData.check_out,
        editFormData.reason
      );

      if (response.success) {
        toast.success(response.message);
        handleCloseEditModal();
        fetchAttendances();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update attendance';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();

    if (!deleteReason || deleteReason.length < 10) {
      toast.error('Reason is required (minimum 10 characters)');
      return;
    }

    try {
      setSubmitting(true);
      const response = await deleteAttendance(editingAttendance.id, deleteReason);

      if (response.success) {
        toast.success(response.message);
        handleCloseDeleteModal();
        fetchAttendances();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete attendance';
      toast.error(message);
    } finally {
      setSubmitting(false);
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Absensi</h1>
          <p className="text-gray-600 mt-1">Kelola semua catatan absensi karyawan</p>
        </div>

        {/* Date Filter */}
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
            <div className="w-full sm:flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="w-full sm:flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto"
                onClick={handleFilter}
              >
                Terapkan Filter
              </Button>
            </div>
          </div>
        </Card>

        {/* Attendances List */}
        <Card>
          {attendances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada catatan absensi ditemukan untuk periode yang dipilih
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Karyawan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Jam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tugas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendances.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="text-primary-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {attendance.user?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {attendance.user?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(attendance.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(attendance.check_in)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.check_out ? formatTime(attendance.check_out) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatHours(attendance.total_hours)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="text-green-600">
                            {attendance.tasks?.filter(t => t.is_completed).length || 0} selesai
                          </span>
                          <span className="text-red-600">
                            {attendance.tasks?.filter(t => !t.is_completed).length || 0} belum selesai
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(attendance)}
                            className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(attendance)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {attendances.length > 0 && (
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              perPage={pagination.per_page}
              total={pagination.total}
              from={pagination.from}
              to={pagination.to}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
            />
          )}
        </Card>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          title="Edit Absensi"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Karyawan
              </label>
              <div className="input-field bg-gray-100">
                {editingAttendance?.user?.name} ({editingAttendance?.user?.email})
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check In
              </label>
              <input
                type="datetime-local"
                value={editFormData.check_in}
                onChange={(e) => setEditFormData({ ...editFormData, check_in: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check Out
              </label>
              <input
                type="datetime-local"
                value={editFormData.check_out}
                onChange={(e) => setEditFormData({ ...editFormData, check_out: e.target.value })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editFormData.reason}
                onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                className="input-field w-full"
                rows="3"
                placeholder="Alasan untuk mengedit absensi ini (minimal 10 karakter)"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseEditModal}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Memperbarui...' : 'Perbarui Absensi'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          title="Hapus Absensi"
        >
          <form onSubmit={handleDeleteSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Apakah Anda yakin ingin menghapus catatan absensi untuk{' '}
                <strong>{editingAttendance?.user?.name}</strong>?
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Tanggal: {formatDate(editingAttendance?.date)}<br />
                Check In: {formatTime(editingAttendance?.check_in)}<br />
                Check Out: {editingAttendance?.check_out ? formatTime(editingAttendance.check_out) : '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="input-field w-full"
                rows="3"
                placeholder="Alasan untuk menghapus absensi ini (minimal 10 karakter)"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseDeleteModal}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="danger"
                disabled={submitting}
              >
                {submitting ? 'Menghapus...' : 'Hapus Absensi'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};
