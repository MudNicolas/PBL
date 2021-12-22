<template>
    <el-table
        :data="tableData"
        :span-method="objectSpanMethod"
        border
        style="width: 100%; margin-top: 20px"
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
    </el-table>
</template>

<script>
export default {
    props: ["groupData", "classData", "memberData"],
    data() {
        return {
            tableData: [],
        }
    },
    created() {
        this.init()
    },
    methods: {
        init() {
            let memberData = this.memberData
            let authorType
            if (memberData.length === 0) {
                memberData = [{ data: this.groupData }]
                authorType = "个人"
            } else {
                authorType = "小组"
            }

            let classData = this.classData
            let mostInClass = classData.most[0]
            let avgInClass = classData.avg[0]
            let totalInGroup = memberData
                .map(e => e.data[0])
                .reduce(function (prev, cur) {
                    return prev + cur
                }, 0)
            let tableData = memberData.map(member => {
                return {
                    authorType,
                    name: member.name,
                    commentNumber: member.data[0],
                    groupCommentNumber: totalInGroup,
                    mostInClass,
                    avgInClass,
                }
            })
            console.log(tableData)
            this.tableData = tableData
        },
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            let notSpanCol = [1, 2]
            if (notSpanCol.indexOf(columnIndex) === -1) {
                if (rowIndex === 0)
                    return {
                        rowspan: this.tableData.length,
                        colspan: 1,
                    }
                else return [0, 0]
            }
        },
    },
}
</script>

<style>
</style>
