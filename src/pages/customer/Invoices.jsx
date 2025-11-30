import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  invoices, 
  orders, 
  services, 
  parts,
  getInvoicesByCustomer 
} from '../../mockData';
import './Invoices.css';

const Invoices = () => {
  const { t } = useTranslation();
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const invoicesPerPage = 6;

  const customerId = 1; // Simulating logged-in customer

  useEffect(() => {
    // Load customer's invoices
    const invoicesList = getInvoicesByCustomer(customerId, invoices);
    setCustomerInvoices(invoicesList);
    setFilteredInvoices(invoicesList);
  }, []);

  // Filter and search
  useEffect(() => {
    let result = customerInvoices;

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(inv => inv.paymentStatus === statusFilter);
    }

    // Search by invoice number
    if (searchTerm) {
      result = result.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvoices(result);
    setCurrentPage(1); // Reset to first page
  }, [searchTerm, statusFilter, customerInvoices]);

  // Pagination
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleViewDetails = (invoice) => {
    const order = orders.find(o => o.id === invoice.orderId);
    setSelectedInvoice({ ...invoice, order });
    setShowDetailModal(true);
  };

  const handleDownloadInvoice = (invoice) => {
    // Placeholder for PDF download
    alert(`${t('invoices.downloading')} ${invoice.invoiceNumber}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      paid: { bg: 'success', text: t('invoices.paid'), icon: 'bi-check-circle-fill' },
      unpaid: { bg: 'danger', text: t('invoices.unpaid'), icon: 'bi-x-circle-fill' },
      pending: { bg: 'warning', text: t('invoices.pending'), icon: 'bi-clock-fill' }
    };
    const statusData = statusMap[status] || statusMap.pending;
    const { bg, text, icon } = statusData;
    return (
      <span className={`badge bg-${bg}`}>
        <i className={`bi ${icon} me-1`}></i>
        {text}
      </span>
    );
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      cash: t('invoices.cash'),
      card: t('invoices.card'),
      transfer: t('invoices.transfer'),
      vnpay: 'VNPay',
      momo: 'MoMo'
    };
    return methodMap[method] || method;
  };

  // Calculate stats
  const totalPaid = customerInvoices.filter(inv => inv.paymentStatus === 'paid').length;
  const totalUnpaid = customerInvoices.filter(inv => inv.paymentStatus === 'unpaid').length;
  const totalPending = customerInvoices.filter(inv => inv.paymentStatus === 'pending').length;
  const totalAmount = customerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="invoices-page">
      <div className="page-header mb-4">
        <h2><i className="bi bi-receipt me-2"></i>{t('invoices.title')}</h2>
        <p className="text-muted">{t('invoices.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="stat-card bg-success-subtle">
            <div className="stat-icon bg-success">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{totalPaid}</h3>
              <p>{t('invoices.paid')}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stat-card bg-danger-subtle">
            <div className="stat-icon bg-danger">
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{totalUnpaid}</h3>
              <p>{t('invoices.unpaid')}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stat-card bg-warning-subtle">
            <div className="stat-icon bg-warning">
              <i className="bi bi-clock-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{totalPending}</h3>
              <p>{t('invoices.pending')}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stat-card bg-primary-subtle">
            <div className="stat-icon bg-primary">
              <i className="bi bi-currency-dollar"></i>
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(totalAmount)}</h3>
              <p>{t('invoices.totalAmount')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t('invoices.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t('invoices.allStatus')}</option>
                <option value="paid">{t('invoices.paid')}</option>
                <option value="unpaid">{t('invoices.unpaid')}</option>
                <option value="pending">{t('invoices.pending')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{t('invoices.invoiceNumber')}</th>
                  <th>{t('invoices.date')}</th>
                  <th>{t('invoices.amount')}</th>
                  <th>{t('invoices.paymentMethod')}</th>
                  <th>{t('invoices.status')}</th>
                  <th>{t('invoices.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.length > 0 ? (
                  currentInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <strong>{invoice.invoiceNumber}</strong>
                      </td>
                      <td>{new Date(invoice.issueDate).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <div className="fw-bold">{formatCurrency(invoice.totalAmount)}</div>
                        {invoice.discount > 0 && (
                          <small className="text-muted">
                            {t('invoices.discount')}: -{formatCurrency(invoice.discount)}
                          </small>
                        )}
                      </td>
                      <td>{getPaymentMethodText(invoice.paymentMethod)}</td>
                      <td>{getPaymentStatusBadge(invoice.paymentStatus)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleViewDetails(invoice)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          {t('invoices.view')}
                        </button>
                        {invoice.paymentStatus === 'paid' && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleDownloadInvoice(invoice)}
                          >
                            <i className="bi bi-download me-1"></i>
                            {t('invoices.download')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <i className="bi bi-inbox display-4 text-muted d-block mb-2"></i>
                      <p className="text-muted">{t('invoices.noInvoices')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      {t('invoices.first')}
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {t('invoices.previous')}
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, index) => (
                    <li
                      key={index + 1}
                      className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {t('invoices.next')}
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      {t('invoices.last')}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-receipt me-2"></i>
                  {t('invoices.invoiceDetails')} - {selectedInvoice.invoiceNumber}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p><strong>{t('invoices.invoiceNumber')}:</strong> {selectedInvoice.invoiceNumber}</p>
                    <p><strong>{t('invoices.issueDate')}:</strong> {new Date(selectedInvoice.issueDate).toLocaleDateString('vi-VN')}</p>
                    <p><strong>{t('invoices.dueDate')}:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>{t('invoices.paymentMethod')}:</strong> {getPaymentMethodText(selectedInvoice.paymentMethod)}</p>
                    <p><strong>{t('invoices.status')}:</strong> {getPaymentStatusBadge(selectedInvoice.paymentStatus)}</p>
                    {selectedInvoice.paymentDate && (
                      <p><strong>{t('invoices.paymentDate')}:</strong> {new Date(selectedInvoice.paymentDate).toLocaleDateString('vi-VN')}</p>
                    )}
                  </div>
                </div>

                <hr />

                <h6 className="mb-3">{t('invoices.itemDetails')}</h6>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>{t('invoices.description')}</th>
                      <th className="text-end">{t('invoices.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.order && selectedInvoice.order.services && selectedInvoice.order.services.map((serviceId) => {
                      const service = services.find(s => s.id === serviceId);
                      return service ? (
                        <tr key={serviceId}>
                          <td>{service.name}</td>
                          <td className="text-end">{formatCurrency(service.price)}</td>
                        </tr>
                      ) : null;
                    })}
                    {selectedInvoice.order && selectedInvoice.order.parts && selectedInvoice.order.parts.map((partId) => {
                      const part = parts.find(p => p.id === partId);
                      return part ? (
                        <tr key={partId}>
                          <td>{part.name} (x1)</td>
                          <td className="text-end">{formatCurrency(part.price)}</td>
                        </tr>
                      ) : null;
                    })}
                  </tbody>
                </table>

                <hr />

                <div className="row">
                  <div className="col-md-6 offset-md-6">
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>{t('invoices.subtotal')}:</strong></td>
                          <td className="text-end">{formatCurrency(selectedInvoice.subtotal)}</td>
                        </tr>
                        <tr>
                          <td><strong>{t('invoices.tax')} ({selectedInvoice.tax}%):</strong></td>
                          <td className="text-end">{formatCurrency(selectedInvoice.subtotal * selectedInvoice.tax / 100)}</td>
                        </tr>
                        {selectedInvoice.discount > 0 && (
                          <tr>
                            <td>
                              <strong>{t('invoices.discount')}:</strong>
                              {selectedInvoice.discountType && (
                                <small className="text-muted d-block">
                                  ({selectedInvoice.discountType === 'loyalty' ? t('invoices.loyaltyDiscount') : t('invoices.promotionDiscount')})
                                </small>
                              )}
                            </td>
                            <td className="text-end text-danger">-{formatCurrency(selectedInvoice.discount)}</td>
                          </tr>
                        )}
                        <tr className="table-active">
                          <td><strong>{t('invoices.total')}:</strong></td>
                          <td className="text-end"><strong>{formatCurrency(selectedInvoice.totalAmount)}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <>
                    <hr />
                    <p><strong>{t('invoices.notes')}:</strong></p>
                    <p className="text-muted">{selectedInvoice.notes}</p>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  {t('invoices.close')}
                </button>
                {selectedInvoice.paymentStatus === 'paid' && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handleDownloadInvoice(selectedInvoice)}
                  >
                    <i className="bi bi-download me-1"></i>
                    {t('invoices.download')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
