export function noIntro(val) {
    if (!val) {
        return "暂无简介"
    }
    return val
}
export function tagTypeFilter(val) {
    let map = {
        //审批中
        underApprove: "warning",
        //待审批
        beforeApprove: "danger",
        normal: "",
        conclude: "success",
        rejected: "danger",
        concludeRejected: "danger",
        underConcludeApprove: "warning",
    }
    return map[val] || ""
}
export function statusFilter(val) {
    let map = {
        //审批中
        underApprove: "审批中",
        //待审批
        beforeApprove: "待提审",
        normal: "行进中",
        underConcludeApprove: "结题审批中",
        conclude: "已结题",
        concludeRejected: "结题审核驳回",
        rejected: "审核驳回",
        approved: "审核通过",
    }
    return map[val] || ""
}
export function stageColorFilter(val) {
    let map = {
        underApprove: "#E6A23C",
        underConcludeApprove: "#E6A23C",
        beforeApprove: "#409EFF",
        normal: "#409EFF",
        conclude: "#67C23A",
        rejected: "#F56C6C",
        concludeRejected: "#F56C6C",
        approved: "#67C23A",
    }
    return map[val] || ""
}
