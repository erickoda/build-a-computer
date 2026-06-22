package com.buildpc.benchmark_microservice.entities.valueObjects;

import org.hibernate.type.descriptor.WrapperOptions;
import org.hibernate.usertype.UserType;
import org.postgresql.util.PGobject;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

public class PSURankingUserType implements UserType<PSURanking> {
    @Override
    public int getSqlType() {
        return Types.OTHER;
    }

    @Override
    public Class<PSURanking> returnedClass() {
        return PSURanking.class;
    }

    @Override
    public PSURanking nullSafeGet(ResultSet rs, int position,
                               WrapperOptions options) throws SQLException {
        Object value = rs.getObject(position);
        if (rs.wasNull() || value == null) return null;
        return PSURanking.fromDatabaseValue(value.toString());
    }

    @Override
    public void nullSafeSet(PreparedStatement st, PSURanking value, int index,
                            WrapperOptions options) throws SQLException {
        if (value == null) {
            st.setNull(index, Types.OTHER);
        } else {
            PGobject pgObject = new PGobject();
            pgObject.setType("psu_ranking");
            pgObject.setValue(value.toDatabaseValue());
            st.setObject(index, pgObject);
        }
    }

    @Override
    public boolean equals(PSURanking x, PSURanking y) { return x == y; }

    @Override
    public int hashCode(PSURanking x) { return x != null ? x.hashCode() : 0; }

    @Override
    public PSURanking deepCopy(PSURanking value) { return value; }

    @Override
    public boolean isMutable() { return false; }

    @Override
    public Serializable disassemble(PSURanking value) { return value; }

    @Override
    public PSURanking assemble(Serializable cached, Object owner) { return (PSURanking) cached; }
}
