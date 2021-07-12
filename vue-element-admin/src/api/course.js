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
		url: '/course/manage/info/get',
		method: 'post',
		data
	})
}

export function submitEdit(data) {
	return request({
		url: '/course/manage/info/edit',
		method: 'post',
		data
	})
}

export function getStudentList(data) {
	return request({
		url: '/course/manage/student/get',
		method: 'post',
		data
	})
}

export function submitStudentList(data) {
	return request({
		url: '/course/manage/student/submit',
		method: 'post',
		data
	})
}

export function getAllTeacher(data) {
	return request({
		url: '/course/manage/partner/getAllTeacher',
		method: 'post',
		data
	})
}

export function manageSearchTeacher(data) {
	return request({
		url: '/course/manage/partner/search/teacher',
		method: 'post',
		data
	})
}

export function addPartnerTeacher(data) {
	return request({
		url: '/course/manage/partner/addTeacher',
		method: 'post',
		data
	})
}

export function getAllCommentTemplate(data) {
	return request({
		url: '/course/manage/commentTemplate/get',
		method: 'post',
		data
	})
}

export function submitNewCommentTemplate(data) {
	return request({
		url: '/course/manage/commentTemplate/create',
		method: 'post',
		data
	})
}

export function editCommentTemplate(data) {
	return request({
		url: '/course/manage/commentTemplate/edit',
		method: "post",
		data
	})
}

export function deleteCommentTemplate(data) {
	return request({
		url: '/course/manage/commentTemplate/delete',
		method: 'post',
		data
	})
}

export function getGroup(query) {
	return request({
		url: '/course/manage/group/get',
		method: 'get',
		params: query
	})
}

export function getUnGroupedStudents(query) {
	return request({
		url: '/course/manage/group/unGroupedStudents/get',
		method: 'get',
		params: query
	})
}

