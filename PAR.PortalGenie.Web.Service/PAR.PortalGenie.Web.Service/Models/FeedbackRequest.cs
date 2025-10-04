namespace PAR.PortalGenie.Web.Service.Models;

public class FeedbackRequest
{
    public string Query { get; set; } = string.Empty;
    public List<string> Matches { get; set; } = new();
    public string Feedback { get; set; } = "positive";
}
