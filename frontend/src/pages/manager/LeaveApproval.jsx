import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Modal } from '../../components/common/Modal';
import { getAllLeaveRequests, approveLeave, rejectLeave } from '../../api/manager.api';
import { formatDate } from '../../utils/dateHelpers';
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const LeaveApproval = () => {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await getAllLeaveRequests(filterStatus);
      
      if (response.success) {
        setLeaves(response.data);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setNotes('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLeave(null);
    setActionType(null);
    setNotes('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      
      let response;
      if (actionType === 'approve') {
        response = await approveLeave(selectedLeave.id, notes);
      } else {
        response = await rejectLeave(selectedLeave.id, notes);
      }
      
      if (response.success) {
        toast.success(response.message);
        handleCloseModal();
        fetchLeaves();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
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
            <h1 className="text-3xl font-bold text-gray-900">Leave Approval</h1>
            <p className="text-gray-600 mt-1">Review and manage employee leave requests</p>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Leave Requests List */}
        <Card>
          {leaves.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {filterStatus 
                  ? `No ${filterStatus} leave requests found`
                  : 'No leave requests found'}
              </p>
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
                        <p className="font-semibold text-gray-900">{leave.user.name}</p>
                        <p className="text-sm text-gray-600">{leave.user.email}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${getStatusBadge(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                    <p className="text-sm text-gray-600">{leave.reason}</p>
                  </div>

                  {leave.notes && (
                    <div className="bg-blue-50 rounded p-3 mb-3">
                      <p className="text-sm font-medium text-blue-700 mb-1">Notes:</p>
                      <p className="text-sm text-blue-600">{leave.notes}</p>
                    </div>
                  )}

                  {leave.approver && (
                    <p className="text-xs text-gray-500 mb-3">
                      {leave.status === 'approved' ? 'Approved' : 'Rejected'} by {leave.approver.name} on {formatDate(leave.approved_at)}
                    </p>
                  )}

                  {leave.status === 'pending' && (
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleOpenModal(leave, 'approve')}
                        variant="success"
                        className="flex-1"
                      >
                        <CheckCircle size={18} className="mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleOpenModal(leave, 'reject')}
                        variant="danger"
                        className="flex-1"
                      >
                        <XCircle size={18} className="mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Approve/Reject Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        size="md"
      >
        {selectedLeave && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Employee:</strong> {selectedLeave.user.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Period:</strong> {formatDate(selectedLeave.start_date)} - {formatDate(selectedLeave.end_date)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Reason:</strong> {selectedLeave.reason}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field"
                rows="4"
                placeholder={actionType === 'approve' 
                  ? 'Add approval notes (optional)' 
                  : 'Provide reason for rejection (optional)'}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                variant={actionType === 'approve' ? 'success' : 'danger'}
              >
                {submitting ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </MainLayout>
  );
};
