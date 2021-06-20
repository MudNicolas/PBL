import request from '@/utils/request'

export function searchTeacher(data) {
	return request({
		url: '/course/search/teacher',
		method: 'post',
		data
	})
}

export function getCover(data) {
	return request({
		url: '/course/cover/get',
		method: 'post',
		data
	})
}

export function getCourseList(data) {
	return request({
		url: '/course/getList',
		method: 'post',
		data
	})
}

export function uploadCreateCourse(data) {
	return request({
		url: '/course/create',
		method: 'post',
		data
	})
}

export function getCourseRoute() {
	return request({
		url: '/course/route',
		method: 'get'
	})
}

export function getInfo(data) {
	return request({
		url: '/course/manage/getInfo',
		method: 'post',
		data
	})
}

export function submitEdit(data) {
	return request({
		url: '/course/manage/editInfo',
		method: 'post',
		data
	})
}

