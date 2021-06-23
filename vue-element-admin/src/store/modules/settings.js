import variables from '@/styles/element-variables.scss'
import defaultSettings from '@/settings'
import { submitThemeSetting, getThemeSetting } from '@/api/theme'

const { showSettings, tagsView, fixedHeader } = defaultSettings

const state = {
	showSettings: showSettings,
	theme: variables.theme,

	fixedHeader: fixedHeader
}

const mutations = {
	CHANGE_SETTING: (state, { key, value }) => {
		// eslint-disable-next-line no-prototype-builtins
		if (state.hasOwnProperty(key)) {
			state[key] = value
		}
	}
}

const actions = {
	changeSetting({ commit }, data) {
		/*   console.log(data) */
		submitThemeSetting(data)

		commit('CHANGE_SETTING', data)
	},

	getThemeSetting({ commit }, key) {
		return new Promise((resolve, reject) => {
			getThemeSetting(key).then(response => {
				const { data } = response
				commit('CHANGE_SETTING', data)
				/* console.log(state) */
				resolve(data)
			}).catch(error => {
				reject(error)
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

