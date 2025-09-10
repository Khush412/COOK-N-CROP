import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';

const REPORT_REASONS = [
  'Spam or Misleading',
  'Harassment or Hate Speech',
  'Inappropriate Content',
  'Copyright Infringement',
];

const ReportDialog = ({ open, onClose, onSubmit, loading, contentType = 'content' }) => {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');

  const handleSubmit = () => {
    const fullReason = details ? `${reason}: ${details}` : reason;
    onSubmit(fullReason);
  };

  const handleClose = () => {
    if (loading) return;
    setReason(REPORT_REASONS[0]);
    setDetails('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Report {contentType}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please select a reason for reporting this {contentType}. Your report is anonymous to other users.
        </Typography>
        <RadioGroup
          aria-label="report reason"
          name="report-reason-group"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          {REPORT_REASONS.map((r) => (
            <FormControlLabel key={r} value={r} control={<Radio />} label={r} />
          ))}
        </RadioGroup>
        <TextField
          label="Additional Details (optional)"
          multiline
          rows={3}
          fullWidth
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="error" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;
