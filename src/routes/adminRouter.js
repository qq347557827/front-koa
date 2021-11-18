import Router from 'koa-router';
import UserController from '../api/UserController';
import adminController from '../api/AdminController';

const router = new Router()

router.prefix('/admin')

router.post('/add_user', UserController.addUser)

router.post('/delete_user', UserController.deleteUser)

router.get('/get_menu', adminController.getMenu)

router.post('/add_menu', adminController.addMenu)

router.post('/update_menu', adminController.updateMenu)

router.post('/delete_menu', adminController.deleteMenu)

router.get('/get_roles', adminController.getRoles)

router.post('/add_role', adminController.addRole)

router.post('/update_role', adminController.updateRole)

router.post('/delete_role', adminController.deleteRole)

router.get('/get_roles_title', adminController.getRolesTitle)

router.get('/get_routes', adminController.getRoutes)

export default router