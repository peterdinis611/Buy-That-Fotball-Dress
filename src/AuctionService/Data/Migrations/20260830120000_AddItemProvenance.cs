using System;
using AuctionService.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuctionService.Data.Migrations
{
    [DbContext(typeof(AuctionDbContext))]
    [Migration("20260830120000_AddItemProvenance")]
    public partial class AddItemProvenance : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "Match", table: "Item", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<DateTime>(name: "MatchDate", table: "Item", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<string>(name: "Opponent", table: "Item", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<string>(name: "PitchPhotoUrl", table: "Item", type: "TEXT", nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Match", table: "Item");
            migrationBuilder.DropColumn(name: "MatchDate", table: "Item");
            migrationBuilder.DropColumn(name: "Opponent", table: "Item");
            migrationBuilder.DropColumn(name: "PitchPhotoUrl", table: "Item");
        }
    }
}
