const StatusBadge = ({ status }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'pending':
        return 'badge badge-pending';
      case 'processing':
        return 'badge badge-processing';
      case 'completed':
        return 'badge badge-completed';
      default:
        return 'badge bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'processing':
        return 'Diproses';
      case 'completed':
        return 'Selesai';
      default:
        return status;
    }
  };

  return <span className={getStatusClass()}>{getStatusText()}</span>;
};

export default StatusBadge;
