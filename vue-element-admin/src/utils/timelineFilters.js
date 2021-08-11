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
        beforeApprove: "warning",
        normal: "",
        conclude: "success",
        rejected: "danger",
    }
    return map[val] || ""
}
export function statusFilter(val) {
    let map = {
        //审批中
        underApprove: "审批中",
        //待审批
        beforeApprove: "待审批",
        normal: "行进中",
        conclude: "结题",
    }
    return map[val] || ""
}
export function stageColorFilter(val) {
    let map = {
        underApprove: "#E6A23C",
        beforeApprove: "#409EFF",
        normal: "#409EFF",
        conclude: "#67C23A",
        rejected: "#F56C6C",
    }
    return map[val] || ""
}
