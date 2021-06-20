import request from '@/utils/request'

export function getBreadCrumb(data) {
	return request({
		url: '/breadCrumb/get',
		method: 'post',
		data
	})
}
