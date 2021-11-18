import { menusGetMenuData } from "../conmon/Utils";
import Menus from "../model/Menus";
import Roles from "../model/Roles";
import User from '../model/test';
import { source, toTree } from './toTree';

class adminController {
  async getMenu (ctx) {
    const menu = await Menus.find()
    ctx.body = {
      code: 200,
      data: menu
    }

  }

  async addMenu (ctx) {
    const body = ctx.request.body

    // 
    // const treeArr = toTree(source)
    // 
    const newMenu = new Menus(body)
    const result = await newMenu.save()
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async updateMenu (ctx) {
    const { body } = ctx.request
    // 
    const data = { ...body }
    delete data._id

    const result = await Menus.updateOne({ _id: body._id }, { ...data })
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async deleteMenu (ctx) {
    const { body } = ctx.request
    const result = await Menus.deleteOne({ _id: body._id })
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async getRoles (ctx) {
    const result = await Roles.find()
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async addRole (ctx) {
    const body = ctx.request.body

    const newRole = new Roles(body)
    const result = await newRole.save()
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async updateRole (ctx) {
    const { body } = ctx.request
    // 
    const data = { ...body }
    delete data._id

    const result = await Roles.updateOne({ _id: body._id }, { ...data })
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async deleteRole (ctx) {
    const { body } = ctx.request
    const result = await Roles.deleteOne({ _id: body._id })
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async getRolesTitle (ctx) {
    const result = await Roles.find({}, { menu: 0 })
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async getRoutes (ctx) {



    let menus = []

    if (!ctx.isAdmin) {
      const user = await User.findOne({ _id: ctx._id })
      const { roles } = user

      for (let i = 0; i < roles.length; i++) {
        const element = roles[i];
        const menu = await Roles.findOne({ code: element }, { menu: 1 })
        menus.push(...menu.menu)
      }
      menus = Array.from(new Set(menus))
    }


    const treeData = await Menus.find()

    const routes = menusGetMenuData(treeData, menus, ctx.isAdmin)
    ctx.body = {
      code: 200,
      data: routes
    }
  }

}

export default new adminController()