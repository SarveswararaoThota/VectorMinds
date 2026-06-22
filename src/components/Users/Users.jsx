import React, { useState } from 'react';
import UserList from './UserList.jsx';
import UserForm from './UserForm.jsx';
import UserView from './UserView.jsx';

export default function Users({ currentUser }) {
  const [screen, setScreen]         = useState('list');
  const [selectedUser, setSelected] = useState(null);

  const goList   = ()     => { setScreen('list');   setSelected(null); };
  const goCreate = ()     => { setScreen('create'); setSelected(null); };
  const goEdit   = (user) => { setScreen('edit');   setSelected(user); };
  const goView   = (user) => { setScreen('view');   setSelected(user); };

  if (screen === 'create') return <UserForm currentUser={currentUser} onBack={goList} onSave={goList} />;
  if (screen === 'edit')   return <UserForm currentUser={currentUser} user={selectedUser} onBack={goList} onSave={goList} />;
  if (screen === 'view')   return <UserView user={selectedUser} onBack={goList} onEdit={goEdit} />;

  return <UserList currentUser={currentUser} onCreateUser={goCreate} onEditUser={goEdit} onViewUser={goView} />;
}