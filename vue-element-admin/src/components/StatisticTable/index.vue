<template>
    <el-table
        :data="tableData"
        :span-method="objectSpanMethod"
        border
        style="width: 100%; margin-top: 20px"
    >
        <el-table-column label="项目类别" align="center">
            <template slot-scope="scope">
                {{ scope.row.authorType | type }}
            </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" align="center"></el-table-column>
        <el-table-column prop="commentNumber" label="个人总评论量" align="center"></el-table-column>
        <el-table-column
            prop="groupCommentNumber"
            label="小组总评论量"
            align="center"
        ></el-table-column>
        <el-table-column prop="classMost" label="最高小组总评论量" align="center"></el-table-column>
        <el-table-column prop="classAvg" label="小组平均评论量" align="center"></el-table-column>
    </el-table>
</template>

<script>
export default {
    props: ["tableData"],
    filters: {
        type: v => {
            let map = {
                personal: "个人",
                group: "小组",
            }
            return map[v]
        },
    },

    methods: {
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
