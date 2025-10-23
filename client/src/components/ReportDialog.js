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
  Stack,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

const REPORT_REASONS = [
  'Spam or Misleading',
  'Harassment or Hate Speech',
  'Inappropriate Content',
  'Copyright Infringement',
];

const ReportDialog = ({ open, onClose, onSubmit, loading, contentType = 'content' }) => {
  const theme = useTheme();
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
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ReportProblemOutlinedIcon color="error" />
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
            Report {contentType}
          </Typography>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Please select a reason for reporting this {contentType}. Your report is anonymous to other users.
          </Typography>
          <RadioGroup
            aria-label="report reason"
            name="report-reason-group"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REPORT_REASONS.map((r) => (
              <FormControlLabel key={r} value={r} control={<Radio />} label={<Typography sx={{ fontFamily: theme.typography.fontFamily }}>{r}</Typography>} />
            ))}
          </RadioGroup>
          <TextField
            label="Additional Details (optional)"
            multiline
            rows={3}
            fullWidth
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="error" disabled={loading} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px', px: 2 }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;
