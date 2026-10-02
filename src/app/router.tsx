import {createBrowserRouter} from 'react-router-dom';
import {AppLayout} from '../layouts/AppLayout';
import {CanvasLayout} from '../layouts/CanvasLayout';
import {CanvasEditor} from '../features/canvas/CanvasEditor';
import {Placeholder} from '../components/ui/Placeholder';
import {Dashboard} from '../pages/Dashboard';
import {Library} from '../pages/Library';
import {Projects} from '../pages/Projects';
import {ProjectEntry} from '../pages/ProjectEntry';
import {AccessPage} from '../features/auth/AccessPage';
import {SsoCallback} from '../features/auth/SsoCallback';
import {PrivateRoute} from '../features/auth/PrivateRoute';
import {RegisterPage} from '../features/auth/RegisterPage';
import {DiagramEditor} from '../pages/DiagramEditor';
import {PublicShare} from '../pages/PublicShare';

export const router = createBrowserRouter([
    {path: '/share/:token', element: <PublicShare/>},
    {path: '/access', element: <AccessPage/>},
    {path: '/sso-callback', element: <SsoCallback/>},
    {path: '/register', element: <RegisterPage/>},
    {
        path: '/',
        element: <PrivateRoute><AppLayout/></PrivateRoute>,
        children: [
            {
                index: true,
                element: <Dashboard/>,
            },
            {
                path: 'library/*',
                element: <Library/>,
            },
            {
                path: 'projects',
                element: <Projects/>,
            },
            {path: 'projects/:projectId', element: <ProjectEntry/>},
            {path: 'account-error', element: <Placeholder title="No se pudo cargar la cuenta"/>},
        ],
    },
    {path: '/projects/:projectId/diagrams/:diagramId', element: <PrivateRoute><DiagramEditor/></PrivateRoute>},
    {
        path: '/canvas',
        element: <PrivateRoute><CanvasLayout/></PrivateRoute>,
        children: [
            {
                path: ':id',
                element: <CanvasEditor/>,
            }
        ]
    },
]);
