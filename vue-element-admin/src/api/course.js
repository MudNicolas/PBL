import request from '@/utils/request'

export function searchTeacher(data) {
	return request({
		url: '/course/search/teacher',
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

export function getStudentList(data) {
	return request({
		url: '/course/manage/getStudentList',
		method: 'post',
		data
	})
}

export function submitStudentList(data) {
	return request({
		url: '/course/manage/submitStudentList',
		method: 'post',
		data
	})
}

export function getAllTeacher(data) {
	return request({
		url: '/course/manage/getAllTeacher',
		method: 'post',
		data
	})
}

export function manageSearchTeacher(data) {
	return request({
		url: '/course/manage/search/teacher',
		method: 'post',
		data
	})
}

export function addPartnerTeacher(data) {
	return request({
		url: '/course/manage/addPartnerTeacher',
		method: 'post',
		data
	})
}

export function getAllCommentTemplate(data) {
	return request({
		url: '/course/manage/getAllCommentTemplate',
		method: 'post',
		data
	})
}

