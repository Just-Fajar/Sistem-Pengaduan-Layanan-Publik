const StatusBadge = ({ status }) => {
  const config = {
    pending: {
      badgeClass: 'badge-pending',
      dotClass: 'dot-pending',
      label: 'Menunggu',
    },
    processing: {
      badgeClass: 'badge-processing',
      dotClass: 'dot-processing',
      label: 'Diproses',
    },
    completed: {
      badgeClass: 'badge-completed',
      dotClass: 'dot-completed',
      label: 'Selesai',
    },
  };

  const current = config[status] || {
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    dotClass: 'bg-slate-400',
    label: status || 'Unknown',
  };

  return (
    <span className={`badge ${current.badgeClass}`}>
      <span className={`dot ${current.dotClass}`} />
      {current.label}
    </span>
  );
};

export default StatusBadge;
