import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  AdminPanelSettings,
  Person,
  CheckCircle,
  Block,
  Refresh,
  PersonAdd,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import userService from '../../services/userService';

/* ---------- Helpers (consistent with other pages) ---------- */
function SectionCard({ title, action, children, id }) {
  return (
    <Paper
      component="section"
      aria-labelledby={id}
      elevation={2}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {(title || action) && (
        <>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            {title ? (
              <Typography id={id} variant="h6" fontWeight={600}>
                {title}
              </Typography>
            ) : (
              <span />
            )}
            {action || null}
          </Stack>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
    </Paper>
  );
}

const RoleChip = ({ role }) => (
  <Chip
    size="small"
    icon={role === 'admin' ? <AdminPanelSettings /> : <Person />}
    label={role}
    color={role === 'admin' ? 'error' : 'default'}
  />
);

const StatusChip = ({ active }) => (
  <Chip
    size="small"
    icon={active ? <CheckCircle /> : <Block />}
    label={active ? 'Active' : 'Inactive'}
    color={active ? 'success' : 'default'}
  />
);

/* ---------- Main Users Page ---------- */
export default function Users() {
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = useSelector((s) => s.auth.user);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & table state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'active' | 'inactive' | ''
  const [page, setPage] = useState(0); // zero-based for TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const queryParams = useMemo(() => {
    const qp = {
      page: page + 1, // API expected 1-based
      limit: rowsPerPage,
      search: search || undefined,
      role: roleFilter || undefined,
      isActive:
        statusFilter === ''
          ? undefined
          : statusFilter === 'active'
          ? 'true'
          : 'false',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    return qp;
  }, [page, rowsPerPage, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers(queryParams);
      setRows(res?.data?.users || []);
      setTotal(res?.data?.pagination?.total || 0);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to fetch users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const openEdit = (user) => {
    setSelectedUser({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      await userService.updateUser(selectedUser._id, {
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        isActive: selectedUser.isActive,
      });
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      closeEdit();
      fetchUsers();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to update user', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?._id) {
      enqueueSnackbar("You can't delete your own account", { variant: 'warning' });
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userService.deleteUser(userId);
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      // If last item on page removed, adjust page
      const isLastRowOnPage = rows.length === 1 && page > 0;
      if (isLastRowOnPage) setPage(page - 1);
      fetchUsers();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to delete user', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Users
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            sx={{ textTransform: 'none' }}
            disabled
            title="Create user (optional feature)"
          >
            Add User
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Filter & Search */}
      <SectionCard
        id="users-filters"
        title="Filter & Search"
        action={null}
      >
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr auto' },
            alignItems: 'center',
          }}
        >
          <TextField
            placeholder="Search users (name/email)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>

          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
              Search
            </Button>
            <Button
              variant="text"
              sx={{ ml: 1, textTransform: 'none' }}
              onClick={() => {
                setSearch('');
                setRoleFilter('');
                setStatusFilter('');
                setPage(0);
                fetchUsers();
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>
      </SectionCard>

      {/* Users Table */}
      <Box sx={{ mt: 3 }}>
        <SectionCard id="users-table" title="All Users">
          <TableContainer component={Box} sx={{ borderRadius: 1.5 }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading
                  ? [...Array(5)].map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell colSpan={7}>
                          <Skeleton variant="rectangular" height={40} />
                        </TableCell>
                      </TableRow>
                    ))
                  : rows.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No users found. Try a different search or filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                  : rows.map((u) => (
                      <TableRow key={u._id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" noWrap maxWidth={220}>
                              {u.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap maxWidth={240}>
                            {u.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <RoleChip role={u.role} />
                        </TableCell>
                        <TableCell>
                          <StatusChip active={u.isActive} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => openEdit(u)}
                                disabled={false}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteUser(u._id)}
                                disabled={u._id === currentUser?._id}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <TablePagination
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
        </SectionCard>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          {selectedUser ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                value={selectedUser.name}
                onChange={(e) => setSelectedUser((s) => ({ ...s, name: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Email"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser((s) => ({ ...s, email: e.target.value }))}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedUser.role}
                  label="Role"
                  onChange={(e) => setSelectedUser((s) => ({ ...s, role: e.target.value }))}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedUser.isActive ? 'active' : 'inactive'}
                  label="Status"
                  onChange={(e) =>
                    setSelectedUser((s) => ({ ...s, isActive: e.target.value === 'active' }))
                  }
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          ) : (
            <Skeleton variant="rectangular" height={160} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleUpdateUser} variant="contained" disabled={saving}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}