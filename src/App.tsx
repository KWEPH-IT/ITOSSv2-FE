import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import { Loader } from './components/Loader';

// Eagerly-loaded (small/critical, shown before anything else)
import Login from './pages/login';

// Lazily-loaded pages
const HomeRedirect = lazy(() => import('./pages/Home/HomeRedirect'));
const Home = lazy(() => import('./pages/Home/Home'));
const UserHome = lazy(() => import('./pages/Home/UserHome'));
const UnauthorizedPage = lazy(() => import('./pages/Unauthorized'));

const SystemProfilePage = lazy(() => import('./pages/configuration/configSystemProfile/SystemProfilePage'));
const DBColumnsPage = lazy(() => import('./pages/configuration/configDBColumns/DBColumnsPage'));
const DBColumnsDetails = lazy(() => import('./pages/configuration/configDBColumns/DBColumnsDetails'));
const EmailAddressPage = lazy(() => import('./pages/configuration/configEmailAddress/EmailAddressPage'));
const GroupEmailPage = lazy(() => import('./pages/configuration/configGroupEmails/GroupEmailPage'));
const GroupEmailMember = lazy(() => import('./pages/configuration/configGroupEmails/GroupEmailMember'));
const TicketCategoriesPage = lazy(() => import('./pages/configuration/configTicketCategories/TicketCategoriesPage'));

const AssetRequisitionPage = lazy(() => import('./pages/inventory/invAssetRequsition/AssetRequisitionPage'));
// Named export - use .then() to map it to a default export
const EquipmentInvPage = lazy(() =>
  import('./pages/inventory/invEquipment/EquipmentInvPage').then((module) => ({
    default: module.EquipmentInvPage,
  }))
);

const TicketPage = lazy(() => import('./pages/ticketing/tickCreation/TicketPage'));
const TicketCreationForm = lazy(() => import('./pages/ticketing/tickCreation/TicketCreationForm'));
const TicketCreationTable = lazy(() => import('./pages/ticketing/tickCreation/TicketCreationTable'));
const TicketDetails = lazy(() => import('./pages/ticketing/tickCreation/TicketDetails'));
const TicketApprovalPage = lazy(() => import('./pages/ticketing/tickForApproval/TicketApprovalPage'));
const TicketDashboardPage = lazy(() => import('./pages/ticketing/tickDashboard/TicketDashboardPage'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div><Loader/></div>}>
        <Routes>
          {/* Default route to Login */}
          <Route path="/" element={<Login/>} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes */}
          <Route path='/home-redirect' element={<ProtectedRoute><HomeRedirect /></ProtectedRoute> } />
          <Route path="/user-home" element={<ProtectedRoute><UserHome /></ProtectedRoute>}/>
          <Route path="/it-home" element={<ProtectedRoute ITOnly><Home /></ProtectedRoute>}/>

          {/* Configuration */}
          <Route path="/configSystemProfile" element={<ProtectedRoute ITOnly><SystemProfilePage /></ProtectedRoute>}/>
          <Route path="/configDBColumns" element={<ProtectedRoute ITOnly><DBColumnsPage /></ProtectedRoute>}/>
          <Route path="/configDBColumnsDetails/:sa/:sn" element={<ProtectedRoute ITOnly><DBColumnsDetails /></ProtectedRoute>}/>
          <Route path="/configEmailAddress" element={<ProtectedRoute ITOnly><EmailAddressPage /></ProtectedRoute>}/>
          <Route path="/configGroupEmails" element={<ProtectedRoute ITOnly><GroupEmailPage /></ProtectedRoute>}/>
          <Route path="/configGroupMember/:ge" element={<ProtectedRoute ITOnly><GroupEmailMember /></ProtectedRoute>}/>
          <Route path="/configTicketCateg" element={<ProtectedRoute ITOnly><TicketCategoriesPage /></ProtectedRoute>} />

          {/* Inventory */}
          <Route path="/invAssetReq" element={<ProtectedRoute ITOnly><AssetRequisitionPage /></ProtectedRoute>} />
          <Route path="/invEquipment" element={<ProtectedRoute ITOnly><EquipmentInvPage /></ProtectedRoute>} />

          {/* Ticket */}
          <Route path="/ticketCreation" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
          <Route path="/createRequest" element={<ProtectedRoute><TicketCreationForm /></ProtectedRoute>} />
          <Route path="/ticketList" element={<ProtectedRoute><TicketCreationTable /></ProtectedRoute>} />
          <Route path="/ticketDetails/:tn" element={<ProtectedRoute><TicketDetails /></ProtectedRoute>}/>
          <Route path="/ticketApproval" element={<ProtectedRoute><TicketApprovalPage /></ProtectedRoute>}/>
          <Route path="/ticketDashboard" element={<ProtectedRoute><TicketDashboardPage/></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App