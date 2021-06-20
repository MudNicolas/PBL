import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
	if (route.meta && route.meta.roles) {
		return roles.some(role => route.meta.roles.includes(role))
	} else {
		return true
	}
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
	const res = []

	routes.forEach(route => {
		const tmp = { ...route }
		if (hasPermission(roles, tmp)) {
			if (tmp.children) {
				tmp.children = filterAsyncRoutes(tmp.children, roles)
			}
			res.push(tmp)
		}
	})

	return res
}

const state = {
	routes: [],
	addRoutes: []
}

const mutations = {
	SET_ROUTES: (state, routes) => {
		state.addRoutes = routes
		state.routes = constantRoutes.concat(routes)
	}
}

import { getCourseRoute } from '@/api/course'
import router, { resetRouter } from "@/router"

const actions = {
	generateRoutes({ commit, dispatch }, roles) {
		return new Promise(async (resolve, reject) => {
			let accessedRoutes
			accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
			resolve(accessedRoutes)
			if (!roles.includes('admin')) {
				//获取course route
				let courseRoute = await dispatch('getCourseRoute')
					.then(courseRoute => {
						return courseRoute
					})
					.catch((err) => {
						console.log(err)
						reject(err)
						return []
					})
				if (courseRoute !== []) {
					const map = {
						view: () => import('@/views/course/view/index'),
						manage: () => import('@/views/course/manage/index')
					}
					//将后台传来的component替换
					for (let e of courseRoute) {
						e.component = map[e.component]
						e.children[0].component = map['manage']
					}

					console.log("route", courseRoute)

					//加进动态路由
					for (let e of accessedRoutes) {
						// console.log(e.name)
						if (e.name === "Course") {
							//console.log(e)
							e.children = [...courseRoute, ...e.children];
							break;
						}
					}

				}
			}

			//accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })
			/* 	console.log(accessedRoutes, 'axc')
				resetRouter();
				//router表添加
				router.addRoutes(accessedRoutes); */
			//侧边栏添加
			commit('SET_ROUTES', accessedRoutes)


		})
	},
	getCourseRoute() {
		return new Promise((resolve, reject) => {
			getCourseRoute().then(res => {
				let { courseRoute } = res.data
				//console.log(courseRoute)
				resolve(courseRoute)
			}).catch(err => {
				reject(err)
			})
		})
	}
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
