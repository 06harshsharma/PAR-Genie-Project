namespace PAR.PortalGenie.Web.Service.Models;

public class QueryRequest
{
    public string Query { get; set; } = string.Empty;
    public int Limit { get; set; } = 3;
}
