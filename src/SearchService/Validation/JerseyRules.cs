using System.Text.RegularExpressions;

namespace SearchService.Validation;

public static class JerseyRules
{
    public static readonly string[] Sizes = ["XS", "S", "M", "L", "XL", "XXL"];
    public static readonly string[] KitTypes = ["Home", "Away", "Third", "Goalkeeper", "Special"];
    public static readonly string[] Conditions = ["New", "NewWithTags", "Used", "Vintage"];
    public static readonly string[] Statuses = ["Live", "Finished", "ReserveNotMet"];
    public static readonly string[] Sorts = ["EndingSoon", "Newest", "PriceAsc", "PriceDesc"];

    public static readonly Regex SeasonPattern = new(@"^(19|20)\d{2}(/\d{2})?$", RegexOptions.Compiled);
    public static readonly Regex NamePattern = new(@"^[\p{L}0-9][\p{L}0-9 .'\-/]*$", RegexOptions.Compiled);

    public const int MinNameLength = 2;
    public const int MaxNameLength = 100;
    public const int MaxColorLength = 50;
    public const int MaxLeagueLength = 50;
    public const int MaxImageUrlLength = 500;
    public const int MaxMatchLength = 120;
    public const int MaxReservePrice = 1_000_000;
    public const int MinPage = 1;
    public const int MaxPage = 1_000;
    public const int MinPageSize = 1;
    public const int MaxPageSize = 50;
}
