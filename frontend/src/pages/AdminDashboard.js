import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Users, Leaf, Activity, Download, AlertCircle, Edit, Shield, Trophy, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [habits, setHabits] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [userFilter, setUserFilter] = useState('');
  const [habitCategoryFilter, setHabitCategoryFilter] = useState('All');
  
  // Forms & Modals
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  
  const [newHabit, setNewHabit] = useState({ name: '', description: '', category: 'Nature', impactPoints: 10, iconName: 'leaf' });
  const [newAchievement, setNewAchievement] = useState({ name: '', description: '', type: 'STREAK', requiredValue: 5, badgeIcon: 'trophy', badgeColor: '#FFD700', pointsReward: 100 });

  // User Logs Modal
  const [userLogs, setUserLogs] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, habitsData, statsData, achievementsData] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getHabits(),
        adminAPI.getStats(),
        adminAPI.getAchievements()
      ]);
      setUsers(usersData);
      setHabits(habitsData);
      setStats(statsData);
      setAchievements(achievementsData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,ID,Name,Extra Info,Created At\n";
    users.forEach(u => csvContent += `User,${u.id},${u.username},${u.email} - ${u.role} - ${u.accountStatus},${u.createdAt}\n`);
    habits.forEach(h => csvContent += `Habit,${h.id},${h.name},${h.category} - ${h.impactPoints}pts,${h.createdAt}\n`);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "EcoHabit_Export.csv");
    document.body.appendChild(link);
    link.click(); link.remove();
  };

  // User Moderation
  const handleRoleChange = async (id, newRole) => {
    try { const updated = await adminAPI.updateUserRole(id, newRole); setUsers(users.map(u => u.id === id ? updated : u)); } catch(err) { alert('Failed updating role: ' + err.message); }
  };
  const handleStatusChange = async (id, newStatus) => {
    try { const updated = await adminAPI.updateUserStatus(id, newStatus); setUsers(users.map(u => u.id === id ? updated : u)); } catch(err) { alert('Failed updating status: ' + err.message); }
  };

  // User Logs Viewing & Deleting
  const fetchUserLogs = async (user) => {
    try {
      setActiveUser(user);
      const logs = await adminAPI.getUserLogs(user.id);
      setUserLogs(logs);
    } catch(err) { alert('Failed loading logs: ' + err.message); }
  };

  const handleDeleteUserLog = async (logId) => {
    if(window.confirm('Erase this log from existence?')) {
      try {
        await adminAPI.deleteUserLog(logId);
        setUserLogs(userLogs.filter(l => l.id !== logId));
        fetchData(); // Refresh overall stats
      } catch(err) { alert('Failed deleting log: ' + err.message); }
    }
  };

  // Habit Management
  const handleSaveHabit = async (e) => {
    e.preventDefault();
    try {
      if (editingHabit) { const updated = await adminAPI.updateHabit(editingHabit.id, editingHabit); setHabits(habits.map(h => h.id === updated.id ? updated : h)); setEditingHabit(null); }
      else { const created = await adminAPI.createHabit(newHabit); setHabits([...habits, created]); setShowAddHabit(false); setNewHabit({ name: '', description: '', category: 'Nature', impactPoints: 10, iconName: 'leaf' }); }
    } catch (err) { alert(err.message || 'Failed saving habit'); }
  };

  const handleDeleteHabit = async (id) => {
    try { await adminAPI.deleteHabit(id); setHabits(habits.filter(h => h.id !== id)); fetchData(); } catch (err) { alert(err.message || 'Failed to delete habit'); }
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    try { await adminAPI.createAchievement(newAchievement); setNewAchievement({ name: '', description: '', type: 'STREAK', requiredValue: 5, badgeIcon: 'trophy', badgeColor: '#FFD700', pointsReward: 100 }); fetchData(); } catch (err) { alert(err.message || 'Failed to create milestone'); }
  };

  const handleDeleteAchievement = async (id) => {
    try { await adminAPI.deleteAchievement(id); fetchData(); } catch(err) { alert('Failed deleting milestone: ' + err.message); }
  }

  const filteredUsers = useMemo(() => users.filter(u => u.username.toLowerCase().includes(userFilter.toLowerCase()) || u.email.toLowerCase().includes(userFilter.toLowerCase())), [users, userFilter]);
  const filteredHabits = useMemo(() => habitCategoryFilter === 'All' ? habits : habits.filter(h => h.category === habitCategoryFilter), [habits, habitCategoryFilter]);

  const pieData = stats ? [
    { name: 'Total Users', value: stats.totalUsers },
    { name: 'Total Habits', value: stats.totalHabits },
    { name: 'Total Logs', value: stats.totalLogs }
  ] : [];

  const FallingLeaves = () => (
    <div className="leaves-container">
      {[...Array(15)].map((_, i) => (
        <motion.div key={i} className="leaf" initial={{ y: -100, x: Math.random() * window.innerWidth, rotate: 0, opacity: 0 }}
          animate={{ y: window.innerHeight + 100, x: Math.random() * window.innerWidth, rotate: 360, opacity: [0, 0.8, 0] }}
          transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
        ><Leaf size={24} color="rgba(76, 175, 80, 0.4)" /></motion.div>
      ))}
    </div>
  );

  return (
    <div className="admin-dashboard">
      <FallingLeaves />
      <div className="admin-content glass-panel">
        <header className="admin-header">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="admin-title">
            <Leaf className="spin-slow" /> Control Center
          </motion.h1>
          <div className="admin-tabs">
            <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Activity size={18} /> Analytics</button>
            <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><Users size={18} /> Directory</button>
            <button className={`tab-btn ${activeTab === 'habits' ? 'active' : ''}`} onClick={() => setActiveTab('habits')}><Leaf size={18} /> Ecosystem</button>
            <button className={`tab-btn ${activeTab === 'gamify' ? 'active' : ''}`} onClick={() => setActiveTab('gamify')}><Trophy size={18} /> Milestones</button>
          </div>
        </header>

        {loading ? (
          <div className="loader-container">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Leaf size={48} color="#4CAF50" /></motion.div>
            <p>Syncing ecosystem...</p>
          </div>
        ) : error ? (
          <div className="error-state"><AlertCircle size={48} /><p>{error}</p><button className="btn btn-primary" onClick={fetchData}>Retry</button></div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* Analytics Tab */}
            {activeTab === 'overview' && stats && (
              <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="dashboard-stats">
                <div className="stat-card glass-card">
                  <h3>Explorers</h3><div className="stat-value">{stats.totalUsers}</div><Users className="stat-icon" />
                </div>
                <div className="stat-card glass-card">
                  <h3>Active Habits</h3><div className="stat-value">{stats.totalHabits}</div><Leaf className="stat-icon" />
                </div>
                <div className="stat-card glass-card">
                  <h3>Life Logs</h3><div className="stat-value">{stats.totalLogs}</div><Activity className="stat-icon" />
                </div>
                <div className="stat-card glass-card action-card">
                  <h3>Export System Data</h3>
                  <button className="btn btn-outline" onClick={handleExportCSV}><Download size={18} /> Download CSV</button>
                </div>
                
                <div className="glass-card chart-container" style={{ gridColumn: '1 / -1', height: 'clamp(280px, 40vw, 350px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '1rem', padding: 'clamp(0.5rem, 2vw, 1rem)' }}>
                  <h3 style={{marginBottom: '1rem', color:'#4CAF50'}}>Platform Spread Details</h3>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {stats.habitLeaderboard && stats.habitLeaderboard.length > 0 && (
                  <div className="glass-card chart-container dynamic-glow" style={{ gridColumn: '1 / -1', height: 'clamp(280px, 45vw, 400px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '1rem', padding: 'clamp(0.5rem, 2vw, 1rem)' }}>
                    <h3 style={{marginBottom: '1rem', color:'#2E7D32'}}>Master Habits Engagement Ecosystem</h3>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={stats.habitLeaderboard} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} opacity={0.3}/>
                        <XAxis type="number" allowDecimals={false} stroke="#2E7D32" />
                        <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12, fill: '#4CAF50', fontWeight:'bold'}} stroke="#2e7d32" />
                        <Tooltip contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', borderRadius:'10px', border:'1px solid #4CAF50'}} />
                        <Bar dataKey="count" fill="url(#colorGreen)"  name="Total Logs" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#2E7D32', fontWeight: 'bold' }} >
                        </Bar>
                        <defs>
                          <linearGradient id="colorGreen" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="5%" stopColor="#81C784" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4CAF50" stopOpacity={1}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && !activeUser && (
              <motion.div key="users" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="user-management">
                <div style={{ marginBottom: '1rem' }}>
                  <input type="text" placeholder="Search Explorers..." className="form-input" style={{ maxWidth: '400px', width: '100%' }} value={userFilter} onChange={e => setUserFilter(e.target.value)} />
                </div>
                <div className="table-container glass-table" style={{ overflowX: 'auto' }}>
                  <table>
                    <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Logs</th></tr></thead>
                    <tbody>
                      {filteredUsers.map((user, i) => (
                        <motion.tr key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                          <td>{user.username}</td><td>{user.email}</td>
                          <td>
                            <select className="form-input" style={{width:'auto', padding:'4px'}} value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                              <option value="ROLE_USER">USER</option><option value="ROLE_MODERATOR">MODERATOR</option><option value="ROLE_ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td>
                            <select className={`form-input status-${user.accountStatus?.toLowerCase()}`} style={{width:'auto', padding:'4px', color: user.accountStatus === 'BANNED' ? 'red' : 'green'}} value={user.accountStatus || 'ACTIVE'} onChange={(e) => handleStatusChange(user.id, e.target.value)}>
                              <option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="BANNED">Banned</option>
                            </select>
                          </td>
                          <td>
                            <motion.button className="btn-icon" onClick={()=>fetchUserLogs(user)} whileHover={{scale:1.2, color:'#4CAF50'}}><Eye size={18} /></motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* User Specific Logs View */}
            {activeTab === 'users' && activeUser && (
              <motion.div key="userLogs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="user-logs-view">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem'}}>
                  <h3 style={{color: '#2e7d32', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)'}}>Activity Logs for {activeUser.username}</h3>
                  <button className="btn btn-outline" onClick={()=>setActiveUser(null)}>Return to Directory</button>
                </div>
                {userLogs.length === 0 ? <p style={{textAlign:'center', color:'#888', marginTop:'2rem'}}>No habits logged by this user yet.</p> : (
                  <div className="habit-grid">
                    {userLogs.map((log) => (
                      <div key={log.id} className="habit-card glass-card" style={{borderLeft:'4px solid #4CAF50'}}>
                        <div style={{display:'flex', justifyContent: 'space-between'}}>
                          <b>{log.habit?.name}</b>
                          <motion.button className="btn-icon" style={{color: 'red'}} onClick={() => handleDeleteUserLog(log.id)} whileHover={{scale: 1.2}}><Trash2 size={16}/></motion.button>
                        </div>
                        <p style={{fontSize:'0.85em', color:'#555', margin:'0.5rem 0'}}>{log.logDate} • {log.pointsEarned} Points</p>
                        {log.notes && <p style={{fontStyle:'italic', fontSize:'0.9em'}}>"{log.notes}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Habits Tab */}
            {activeTab === 'habits' && (
              <motion.div key="habits" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="habit-management">
                <div className="habit-actions">
                  <select className="form-input" style={{maxWidth:'250px', width:'100%'}} value={habitCategoryFilter} onChange={e => setHabitCategoryFilter(e.target.value)}>
                    <option value="All">All Categories</option><option>Nature</option><option>Energy</option><option>Water</option>
                  </select>
                  <button className="btn btn-primary" onClick={() => { setEditingHabit(null); setShowAddHabit(!showAddHabit); }}><Plus size={18} /> Plant Habit</button>
                </div>
                <AnimatePresence>
                  {(showAddHabit || editingHabit) && (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="add-habit-form glass-form" onSubmit={handleSaveHabit}>
                      <h3>{editingHabit ? 'Edit Master Habit' : 'Seed New Habit'}</h3>
                      <div className="form-group"><label>Name</label><input type="text" required value={editingHabit ? editingHabit.name : newHabit.name} onChange={e => editingHabit ? setEditingHabit({...editingHabit, name: e.target.value}) : setNewHabit({...newHabit, name: e.target.value})} className="form-input" /></div>
                      <div className="form-group"><label>Category</label><select value={editingHabit ? editingHabit.category : newHabit.category} onChange={e => editingHabit ? setEditingHabit({...editingHabit, category: e.target.value}) : setNewHabit({...newHabit, category: e.target.value})} className="form-input"><option>Nature</option><option>Energy</option><option>Water</option><option>Waste</option><option>Food</option><option>Transportation</option></select></div>
                      <div className="form-group"><label>Description</label><textarea required value={editingHabit ? editingHabit.description : newHabit.description} onChange={e => editingHabit ? setEditingHabit({...editingHabit, description: e.target.value}) : setNewHabit({...newHabit, description: e.target.value})} className="form-input" /></div>
                      <div className="form-group"><label>Impact Points</label><input type="number" required value={editingHabit ? editingHabit.impactPoints : newHabit.impactPoints} onChange={e => editingHabit ? setEditingHabit({...editingHabit, impactPoints: parseInt(e.target.value)}) : setNewHabit({...newHabit, impactPoints: parseInt(e.target.value)})} className="form-input" /></div>
                      <div style={{gap:'1rem', display:'flex', marginTop:'1rem'}}><button type="submit" className="btn btn-success">Save</button><button type="button" className="btn btn-outline" onClick={() => {setShowAddHabit(false); setEditingHabit(null);}}>Cancel</button></div>
                    </motion.form>
                  )}
                </AnimatePresence>
                <div className="habit-grid">
                  {filteredHabits.map((habit, i) => (
                    <motion.div key={habit.id} className="habit-card glass-card dynamic-glow" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.05, y: -5 }}>
                      <div className="habit-card-header"><h3 className="habit-title">{habit.name}</h3><span className="habit-category badge">{habit.category}</span></div>
                      <p className="habit-desc">{habit.description}</p>
                      <div className="habit-footer">
                        <span className="habit-points">+{habit.impactPoints} pts</span>
                        <div>
                          <motion.button className="btn-icon" onClick={() => setEditingHabit(habit)}><Edit size={18} /></motion.button>
                          <motion.button className="btn-icon" whileHover={{ scale: 1.2, color: '#ff3333' }} onClick={() => { if(window.confirm('Delete this habit?')) { handleDeleteHabit(habit.id); } }}><Trash2 size={18} /></motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Gamification Tab */}
            {activeTab === 'gamify' && (
               <motion.div key="gamify" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="gamify-management">
                 <form className="glass-form" onSubmit={handleAddAchievement}>
                    <h3 style={{color:'#2E7D32'}}>Create Dynamic Milestone</h3>
                    <div className="form-group"><label>Badge Name</label><input type="text" required value={newAchievement.name} onChange={e=>setNewAchievement({...newAchievement, name:e.target.value})} className="form-input"/></div>
                    <div className="form-group"><label>Requirement Type</label>
                      <select value={newAchievement.type} onChange={e=>setNewAchievement({...newAchievement, type:e.target.value})} className="form-input">
                        <option value="STREAK">Daily Streak</option><option value="POINTS">Total Points</option><option value="TOTAL_HABITS">Total Habits</option>
                      </select>
                    </div>
                    <div className="form-group"><label>Threshold Value</label><input type="number" required value={newAchievement.requiredValue} onChange={e=>setNewAchievement({...newAchievement, requiredValue: parseInt(e.target.value)})} className="form-input"/></div>
                    <div className="form-group"><label>Point Reward</label><input type="number" required value={newAchievement.pointsReward} onChange={e=>setNewAchievement({...newAchievement, pointsReward: parseInt(e.target.value)})} className="form-input"/></div>
                    <button type="submit" className="btn btn-primary" style={{marginTop:'1rem'}}>Deploy Badge to Ecosystem</button>
                 </form>

                 <h3 style={{color: '#2e7d32', marginTop: '2rem', marginBottom:'1rem'}}>Active Ecosystem Milestones</h3>
                 <div className="habit-grid">
                  {achievements.map((ach, i) => (
                    <motion.div key={ach.id} className="habit-card glass-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                      <div className="habit-card-header">
                        <h3 className="habit-title" style={{color:'#555'}}>{ach.name}</h3>
                        <span className="badge" style={{background: ach.badgeColor || '#4CAF50', color:'white'}}>{ach.type}</span>
                      </div>
                      <p className="habit-desc">Earned when threshold reaches {ach.requiredValue}</p>
                      <div className="habit-footer" style={{borderTop:'1px solid rgba(0,0,0,0.1)', paddingTop:'1rem'}}>
                        <span className="habit-points">+{ach.pointsReward} pts</span>
                        <motion.button className="btn-icon" whileHover={{ scale: 1.2, color: '#ff3333' }} onClick={() => { if(window.confirm('Erase this badge completely?')) { handleDeleteAchievement(ach.id); } }}><Trash2 size={18} /></motion.button>
                      </div>
                    </motion.div>
                  ))}
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
