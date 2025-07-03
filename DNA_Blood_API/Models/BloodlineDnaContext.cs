using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

public partial class BloodlineDnaContext : DbContext
{
    public BloodlineDnaContext()
    {
    }

    public BloodlineDnaContext(DbContextOptions<BloodlineDnaContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ChooseMethod> ChooseMethods { get; set; }

    public virtual DbSet<CollectionMethod> CollectionMethods { get; set; }

    public virtual DbSet<Delivery> Deliveries { get; set; }

    public virtual DbSet<DeliveryTask> DeliveryTasks { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<FeedbackResponse> FeedbackResponses { get; set; }

    public virtual DbSet<Locu> Locus { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Participant> Participants { get; set; }

    public virtual DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Result> Results { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Sample> Samples { get; set; }

    public virtual DbSet<SampleKit> SampleKits { get; set; }

    public virtual DbSet<SampleTransfer> SampleTransfers { get; set; }

    public virtual DbSet<SampleType> SampleTypes { get; set; }

    public virtual DbSet<ServicePackage> ServicePackages { get; set; }

    public virtual DbSet<ServicePrice> ServicePrices { get; set; }

    public virtual DbSet<ShiftAssignment> ShiftAssignments { get; set; }

    public virtual DbSet<TestLocusResult> TestLocusResults { get; set; }

    public virtual DbSet<TestType> TestTypes { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserProfile> UserProfiles { get; set; }

    public virtual DbSet<WorkShift> WorkShifts { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("name=Default");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChooseMethod>(entity =>
        {
            entity.HasOne(d => d.CollectionMethod).WithMany().HasConstraintName("FK__Choose_me__colle__787EE5A0");

            entity.HasOne(d => d.ServicePackage).WithMany().HasConstraintName("FK__Choose_me__servi__778AC167");
        });

        modelBuilder.Entity<CollectionMethod>(entity =>
        {
            entity.HasKey(e => e.CollectionMethodId).HasName("PK__Collecti__1B185E47F93FBF80");

            entity.Property(e => e.CollectionMethodId).ValueGeneratedNever();

            entity.HasOne(d => d.TestType).WithMany(p => p.CollectionMethods)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Collectio__TestT__70DDC3D8");
        });

        modelBuilder.Entity<Delivery>(entity =>
        {
            entity.HasKey(e => e.DeliveryId).HasName("PK__Delivery__1C5CF4F53F164EBC");

            entity.HasOne(d => d.Order).WithOne(p => p.Delivery)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery__order___08B54D69");
        });

        modelBuilder.Entity<DeliveryTask>(entity =>
        {
            entity.HasKey(e => e.TaskId).HasName("PK__Delivery__0492148D6D7610E0");

            entity.Property(e => e.AssignedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Manager).WithMany(p => p.DeliveryTaskManagers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery___manag__3864608B");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.DeliveryTasks)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery___order__37703C52");

            entity.HasOne(d => d.Staff).WithMany(p => p.DeliveryTaskStaffs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery___staff__395884C4");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__7A6B2B8C4C6E0210");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Order).WithOne(p => p.Feedback)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback__order___208CD6FA");
        });

        modelBuilder.Entity<FeedbackResponse>(entity =>
        {
            entity.HasKey(e => e.ResponseId).HasName("PK__Feedback__EBECD89661517FEE");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Feedback).WithMany(p => p.FeedbackResponses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback___feedb__25518C17");

            entity.HasOne(d => d.Staff).WithMany(p => p.FeedbackResponses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback___staff__2645B050");
        });

        modelBuilder.Entity<Locu>(entity =>
        {
            entity.HasKey(e => e.LocusId).HasName("PK__Locus__28DB691E648699A8");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__4659622968AFE85B");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.CollectionMethod).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Orders__collecti__00200768");

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Orders__customer__7F2BE32F");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__Order_de__3C5A4080E3C1C0BF");

            entity.HasOne(d => d.MedicalStaff).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_det__medic__04E4BC85");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_det__order__03F0984C");

            entity.HasOne(d => d.ServicePackage).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_det__servi__02FC7413");
        });

        modelBuilder.Entity<Participant>(entity =>
        {
            entity.HasKey(e => e.ParticipantId).HasName("PK__Particip__4E03780677BA66ED");
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Password__3213E83FADC28A81");

            entity.Property(e => e.IsUsed).HasDefaultValue(false);

            entity.HasOne(d => d.User).WithMany(p => p.PasswordResetTokens)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PasswordResetToken_User");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payment__ED1FC9EA9C34A497");

            entity.Property(e => e.PaymentDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Order).WithOne(p => p.Payment)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payment__order_i__1332DBDC");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.PermissionId).HasName("PK__Permissi__E5331AFAACCF785F");
        });

        modelBuilder.Entity<Result>(entity =>
        {
            entity.HasKey(e => e.ResultId).HasName("PK__Result__AFB3C316D8F564EC");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ReportDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.OrderDetail).WithOne(p => p.Result)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Result__order_de__2FCF1A8A");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__760965CC9C2E72B0");

            entity.HasMany(d => d.Permissions).WithMany(p => p.Roles)
                .UsingEntity<Dictionary<string, object>>(
                    "RolePermission",
                    r => r.HasOne<Permission>().WithMany()
                        .HasForeignKey("PermissionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Role_Perm__permi__66603565"),
                    l => l.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Role_Perm__role___656C112C"),
                    j =>
                    {
                        j.HasKey("RoleId", "PermissionId").HasName("PK__Role_Per__C85A5463F20650B5");
                        j.ToTable("Role_Permission");
                        j.IndexerProperty<int>("RoleId").HasColumnName("role_id");
                        j.IndexerProperty<int>("PermissionId").HasColumnName("permission_id");
                    });
        });

        modelBuilder.Entity<Sample>(entity =>
        {
            entity.HasKey(e => e.SampleId).HasName("PK__samples__84ACF7BAAB488E0F");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.Samples)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__samples__order_d__0E6E26BF");

            entity.HasOne(d => d.Participant).WithMany(p => p.Samples).HasConstraintName("FK__samples__partici__0B91BA14");

            entity.HasOne(d => d.SampleType).WithMany(p => p.Samples)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__samples__sample___0C85DE4D");

            entity.HasOne(d => d.Staff).WithMany(p => p.Samples)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__samples__staff_i__0D7A0286");
        });

        modelBuilder.Entity<SampleKit>(entity =>
        {
            entity.HasKey(e => e.SampleKitId).HasName("PK__Sample_k__0BEC49D5F48625E1");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.SampleKits)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_ki__order__18EBB532");

            entity.HasOne(d => d.Staff).WithMany(p => p.SampleKits)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_ki__staff__19DFD96B");
        });

        modelBuilder.Entity<SampleTransfer>(entity =>
        {
            entity.HasKey(e => e.TransferId).HasName("PK__Sample_t__78E6FD3352D59F08");

            entity.Property(e => e.TransferDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MedicalStaff).WithMany(p => p.SampleTransferMedicalStaffs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_tr__medic__3E1D39E1");

            entity.HasOne(d => d.Sample).WithMany(p => p.SampleTransfers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_tr__sampl__3F115E1A");

            entity.HasOne(d => d.Staff).WithMany(p => p.SampleTransferStaffs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_tr__staff__3D2915A8");
        });

        modelBuilder.Entity<SampleType>(entity =>
        {
            entity.HasKey(e => e.SampleTypeId).HasName("PK__Sample_t__52C648969F8F161D");
        });

        modelBuilder.Entity<ServicePackage>(entity =>
        {
            entity.HasKey(e => e.ServicePackageId).HasName("PK__Service___9685932739C58342");
        });

        modelBuilder.Entity<ServicePrice>(entity =>
        {
            entity.HasKey(e => e.ServicePriceId).HasName("PK__Service___B715FBB722A9DB67");

            entity.Property(e => e.ServicePriceId).ValueGeneratedNever();

            entity.HasOne(d => d.ServicePackage).WithMany(p => p.ServicePrices)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Service_p__servi__7B5B524B");
        });

        modelBuilder.Entity<ShiftAssignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId).HasName("PK__ShiftAss__DA8918146F7544F9");

            entity.HasOne(d => d.Shift).WithMany(p => p.ShiftAssignments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ShiftAssi__shift__5812160E");

            entity.HasOne(d => d.User).WithMany(p => p.ShiftAssignments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ShiftAssi__user___571DF1D5");
        });

        modelBuilder.Entity<TestLocusResult>(entity =>
        {
            entity.HasKey(e => e.TestLocusId).HasName("PK__Test_Loc__73699DAE6DB835AF");

            entity.HasOne(d => d.Locus).WithMany(p => p.TestLocusResults)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Test_Locu__locus__339FAB6E");

            entity.HasOne(d => d.Result).WithMany(p => p.TestLocusResults)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Test_Locu__resul__32AB8735");
        });

        modelBuilder.Entity<TestType>(entity =>
        {
            entity.HasKey(e => e.TestTypeId).HasName("PK__TestType__9BB876466C9F5277");

            entity.Property(e => e.TestTypeId).ValueGeneratedNever();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__USERS__B9BE370F470D025A");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Role).WithMany(p => p.Users).HasConstraintName("FK__USERS__role_id__5441852A");
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.ProfileId).HasName("PK__User_pro__AEBB701F9DD671D6");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.User).WithOne(p => p.UserProfile)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__User_prof__user___628FA481");
        });

        modelBuilder.Entity<WorkShift>(entity =>
        {
            entity.HasKey(e => e.ShiftId).HasName("PK__WorkShif__7B267220995444D2");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
