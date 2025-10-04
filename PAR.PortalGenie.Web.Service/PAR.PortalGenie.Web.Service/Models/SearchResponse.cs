namespace PAR.PortalGenie.Web.Service.Models;

public class SearchResponse
{
    public string Query { get; set; } = string.Empty;
    public List<Reports> Matches { get; set; } = new();
    public object? SuggestedFilters { get; set; }
}
