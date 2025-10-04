namespace PAR.PortalGenie.Web.Service.Models;

public class AssistantResponse
{
    // Report search
    public string? Query { get; set; }
    public List<Reports>? Matches { get; set; }
    public object? SuggestedFilters { get; set; }

    // POS read/write
    public string? Status { get; set; }
    public string? Action { get; set; }
    public string? Message { get; set; }
    public ItemResult? Item { get; set; }
}

public class ItemResult
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Price { get; set; }
    public double Discount { get; set; }
}