<template>
    <el-table
        :data="group"
        :span-method="objectSpanMethod"
        border
        style="width: 100%; margin-top: 20px"
        v-loading="loading"
    >
        <el-table-column prop="authorType" label="项目" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名" align="center"></el-table-column>
        <el-table-column prop="commentNumber" label="个人总贴量" align="center"></el-table-column>
        <el-table-column
            prop="groupCommentNumber"
            label="小组总贴量"
            align="center"
        ></el-table-column>
        <el-table-column prop="mostInClass" label="最高小组总贴量" align="center"></el-table-column>
        <el-table-column prop="avgInClass" label="小组平均发帖量" align="center"></el-table-column>

        <el-table-column label="操作" align="center">
            <template slot-scope="scope">
                <!-- <el-button icon="el-icon-message">发送私信</el-button> -->

                <el-button
                    type="primary"
                    v-if="editAndDeleteActive"
                    @click="edit(scope.row.groupID)"
                >
                    <i class="el-icon-edit" />
                    &nbsp;编辑
                </el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import { teacherGetAllStatistics } from "@/api/statistic"

export default {
    props: ["activityId"],
    data() {
        return {
            group: [],
            loading: false,
            studentNumber: 0,
            groupedStudentNumber: 0,
            spanList: new Set([0, 1, 2, 5]),
        }
    },
    created() {
        this.getData()
    },
    methods: {
        getData() {
            teacherGetAllStatistics({ activityID: this.activityId })
        },

        //表合并
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (this.spanList.has(columnIndex)) {
                if (row.length) {
                    return {
                        rowspan: row.length,
                        colspan: 1,
                    }
                } else {
                    return [0, 0]
                }
            }
        },
        getGroup() {
            this.loading = true
            getGroup().then(res => {
                let { studentNumber, group } = res.data
                this.studentNumber = studentNumber
                this.transformGroupData(group)
                this.loading = false
            })
        },
        transformGroupData(raw) {
            let tableData = []
            let index = 0
            for (let group of raw) {
                let groupMember = group.groupMember

                for (let i = 0; i < groupMember.length; i++) {
                    let member = groupMember[i]
                    let item = {
                        _id: member._id,
                        name: member.name,
                        username: member.username,
                    }
                    if (i === 0) {
                        item.length = groupMember.length
                        item.groupName = group.name || "无"
                        item.groupID = group._id
                        index++
                        item.index = index
                    }

                    tableData.push(item)
                }
            }
            this.groupedStudentNumber = tableData.length
            this.group = tableData
        },
        studentSearch(query, item) {
            if (item.username.indexOf(query) !== -1 || item.name.indexOf(query) !== -1) {
                return item
            }
        },
    },
}
</script>

<style>
</style>
