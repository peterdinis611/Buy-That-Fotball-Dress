namespace SettlementService;

public static class HouseCut
{
    public const int Percent = 10;

    public static int Desk(int hammer)
    {
        if (hammer <= 0) return 0;
        return Math.Max(1, (int)Math.Round(hammer * Percent / 100.0, MidpointRounding.AwayFromZero));
    }

    public static int Due(int hammer) => hammer + Desk(hammer);
}
