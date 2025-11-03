import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { Modal } from '../../components/common/Modal';
import { requestLeave, getMyLeaveRequests } from '../../api/leave.api';
import { formatDate } from '../../utils/dateHelpers';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const MyLeave = () => {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await getMyLeaveRequests();
      
      if (response.success) {
        setLeaves(response.data);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Gagal mengambil pengajuan cuti');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.reason.length < 10) {
      toast.error('Alasan harus minimal 10 karakter');
      return;
    }

    try {
      setSubmitting(true);
      const response = await requestLeave(
        formData.start_date,
        formData.end_date,
        formData.reason
      );
      
      if (response.success) {
        toast.success(response.message);
        setShowModal(false);
        setFormData({ start_date: '', end_date: '', reason: '' });
        fetchLeaves();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request leave';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
    };
    return badges[status] || 'badge-info';
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <CheckCircle size={20} className="text-green-600" />;
    if (status === 'rejected') return <XCircle size={20} className="text-red-600" />;
    return <Clock size={20} className="text-yellow-600" />;
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
            <h1 className="text-3xl font-bold text-gray-900">Pengajuan Cuti</h1>
            <p className="text-gray-600 mt-1">Kelola pengajuan cuti Anda</p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Ajukan Cuti</span>
          </Button>
        </div>

        {/* Leave Requests List */}
        <Card>
          {leaves.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Belum ada pengajuan cuti</p>
              <Button
                onClick={() => setShowModal(true)}
                variant="outline"
                className="mt-4"
              >
                Ajukan Cuti Pertama Anda
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(leave.status)}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Diajukan pada {formatDate(leave.requested_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${getStatusBadge(leave.status)}`}>
                      {leave.status === 'pending' ? 'Menunggu' : leave.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Alasan:</p>
                    <p className="text-sm text-gray-600">{leave.reason}</p>
                  </div>

                  {leave.notes && (
                    <div className="bg-blue-50 rounded p-3">
                      <p className="text-sm font-medium text-blue-700 mb-1">Catatan Manager:</p>
                      <p className="text-sm text-blue-600">{leave.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Request Leave Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Ajukan Cuti"
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Tanggal Mulai"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
          />

          <Input
            label="Tanggal Akhir"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
            min={formData.start_date || new Date().toISOString().split('T')[0]}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input-field"
              rows="4"
              placeholder="Harap berikan alasan untuk cuti Anda (minimal 10 karakter)"
              required
              minLength={10}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.reason.length}/500 karakter (minimal 10)
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};
