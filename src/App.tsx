import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import ProtectedRoute from './routes/ProtectedRoute';
import HomeRedirect from './pages/HomeRedirect';
import Home from './pages/Home';
import UserHome from './pages/UserHome';
import SystemProfilePage from './pages/configuration/configSystemProfile/SystemProfilePage';
import DBColumnsPage from './pages/configuration/configDBColumns/DBColumnsPage';
import DBColumnsDetails from './pages/configuration/configDBColumns/DBColumnsDetails';
import EmailAddressPage from './pages/configuration/configEmailAddress/EmailAddressPage';
import GroupEmailPage from './pages/configuration/configGroupEmails/GroupEmailPage';
import GroupEmailMember from './pages/configuration/configGroupEmails/GroupEmailMember';
import AssetRequisitionPage from './pages/inventory/invAssetRequsition/AssetRequisitionPage';
import { EquipmentInvPage } from './pages/inventory/invEquipment/EquipmentInvPage';
import TicketCategoriesPage from './pages/configuration/configTicketCategories/TicketCategoriesPage';
import TicketPage from './pages/ticketing/tickCreation/TicketPage';
import TicketCreationForm from './pages/ticketing/tickCreation/TicketCreationForm';
import TicketCreationTable from './pages/ticketing/tickCreation/TicketCreationTable';
import TicketDetails from './pages/ticketing/tickCreation/TicketDetails';
import TicketApprovalPage from './pages/ticketing/tickForApproval/TicketApprovalPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route to Login */}
        <Route path="/" element={<Login/>} />

        {/* Protected Routes */}
        <Route path='/home-redirect' element={<ProtectedRoute><HomeRedirect /></ProtectedRoute> } />
        <Route path="/user-home" element={<ProtectedRoute><UserHome /></ProtectedRoute>}/>
        <Route path="/it-home" element={<ProtectedRoute><Home /></ProtectedRoute>}/>
        
        {/* Configuration */}
        <Route path="/configSystemProfile" element={<ProtectedRoute><SystemProfilePage /></ProtectedRoute>}/>
        <Route path="/configDBColumns" element={<ProtectedRoute><DBColumnsPage /></ProtectedRoute>}/> 
        <Route path="/configDBColumnsDetails/:sa/:sn" element={<ProtectedRoute><DBColumnsDetails /></ProtectedRoute>}/>
        <Route path="/configEmailAddress" element={<ProtectedRoute><EmailAddressPage /></ProtectedRoute>}/>
        <Route path="/configGroupEmails" element={<ProtectedRoute><GroupEmailPage /></ProtectedRoute>}/>
        <Route path="/configGroupMember/:ge" element={<ProtectedRoute><GroupEmailMember /></ProtectedRoute>}/>
        <Route path="/configTicketCateg" element={<ProtectedRoute><TicketCategoriesPage /></ProtectedRoute>} />
        
        {/* Inventory */}
        <Route path="/invAssetReq" element={<ProtectedRoute><AssetRequisitionPage /></ProtectedRoute>} />
        <Route path="/invEquipment" element={<ProtectedRoute><EquipmentInvPage /></ProtectedRoute>} />


        {/* Ticket */}
        <Route path="/ticketCreation" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
        <Route path="/createRequest" element={<ProtectedRoute><TicketCreationForm /></ProtectedRoute>} />
        <Route path="/ticketList" element={<ProtectedRoute><TicketCreationTable /></ProtectedRoute>} />
        <Route path="/ticketDetails/:tn" element={<ProtectedRoute><TicketDetails /></ProtectedRoute>}/>
        <Route path="/ticketApproval" element={<ProtectedRoute><TicketApprovalPage /></ProtectedRoute>}/>
      </Routes>
    </Router>
  )
}

export default App