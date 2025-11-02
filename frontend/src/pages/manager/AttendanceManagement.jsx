import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { Modal } from '../../components/common/Modal';
import { getAllAttendances, editAttendance, deleteAttendance } from '../../api/manager.api';
import { formatDate, formatTime, formatHours, getMonthStart, getMonthEnd } from '../../utils/dateHelpers';
import { Clock, Edit, Trash2, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const AttendanceManagement = () => {
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState(getMonthStart());
  const [endDate, setEndDate] = useState(getMonthEnd());

  const [editFormData, setEditFormData] = useState({
    check_in: '',
    check_out: '',
    reason: '',
  });

  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const response = await getAllAttendances(startDate, endDate);

      if (response.success) {
        setAttendances(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendances:', error);
      toast.error('Failed to fetch attendances');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchAttendances();
  };

  const handleOpenEditModal = (attendance) => {
    setEditingAttendance(attendance);
    setEditFormData({
      check_in: attendance.check_in ? new Date(attendance.check_in).toISOString().slice(0, 16) : '',
      check_out: attendance.check_out ? new Date(attendance.check_out).toISOString().slice(0, 16) : '',
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
      toast.error('Reason is required (minimum 10 characters)');
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
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Manage all employee attendance records</p>
        </div>

        {/* Date Filter */}
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
            <div className="w-full sm:flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
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
                End Date
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
                Apply Filter
              </Button>
            </div>
          </div>
        </Card>

        {/* Attendances List */}
        <Card>
          {attendances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records found for the selected period
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                            {attendance.tasks?.filter(t => t.is_completed).length || 0} completed
                          </span>
                          <span className="text-red-600">
                            {attendance.tasks?.filter(t => !t.is_completed).length || 0} incomplete
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
                            title="Delete"
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
        </Card>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          title="Edit Attendance"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee
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
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editFormData.reason}
                onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                className="input-field w-full"
                rows="3"
                placeholder="Reason for editing this attendance (minimum 10 characters)"
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Attendance'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          title="Delete Attendance"
        >
          <form onSubmit={handleDeleteSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this attendance record for{' '}
                <strong>{editingAttendance?.user?.name}</strong>?
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Date: {formatDate(editingAttendance?.date)}<br />
                Check In: {formatTime(editingAttendance?.check_in)}<br />
                Check Out: {editingAttendance?.check_out ? formatTime(editingAttendance.check_out) : '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="input-field w-full"
                rows="3"
                placeholder="Reason for deleting this attendance (minimum 10 characters)"
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
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Delete Attendance'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};
